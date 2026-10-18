// ReAct Agentic Orchestrator — Streams a reasoning loop of Gemini function calls, emitting live steps and handling fallbacks.

import { streamGeminiWithTools, callOpenRouterAPI, GeminiContent, GeminiPart } from './llmService';
import { AGENT_TOOLS, executeTool, PendingAction } from './agentTools';
import { AGENT_SYSTEM_PROMPT, buildAugmentedPrompt } from './agentPrompts';
import { retrieveContext, RetrievalResult } from './ragRetrievalService';

// Structure of the agent's finalized reply including source citations and executed tools.
export interface AgentResponse {
  message: string; // The text content of the agent's response.
  sources: SourceCitation[]; // Documents and chunks used to formulate the response.
  toolsUsed: string[]; // Names of the functions executed during processing.
  steps: AgentStep[]; // Chain-of-thought trace shown in the chat UI.
  pendingActions: PendingAction[]; // Destructive actions awaiting user confirmation.
}

// Representation of a context citation shown in the chat UI.
export interface SourceCitation {
  id: string; // Parent entity UUID.
  sourceType: 'note' | 'task' | 'event';
  title: string;
  content: string;
  similarity: number;
}

export type AgentStep =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; ok: boolean; summary: string };

// Live events: steps as they happen, plus answer tokens for the streaming bubble.
export type AgentEvent = AgentStep | { type: 'token'; text: string } | { type: 'reset_draft' };

const MAX_ITERATIONS = 8;
const RAG_TTL_MS = 60_000;
const MUTATING = /^(create_|update_|schedule_|delete_)/;
// Imperative commands don't need retrieval; "what/when/why..." questions do.
const PURE_ACTION = /^\s*(add|create|schedule|set up|remind|delete|remove|mark|complete|finish|reschedule|move|update|rename|archive)\b/i;

const ragCache = new Map<string, { at: number; results: RetrievalResult[] }>();

const cachedContext = async (userId: string, query: string): Promise<RetrievalResult[]> => {
  const key = `${userId}|${query}`;
  const hit = ragCache.get(key);
  if (hit && Date.now() - hit.at < RAG_TTL_MS) return hit.results;
  const results = await retrieveContext(userId, query, 5);
  ragCache.set(key, { at: Date.now(), results });
  return results;
};

const getSystemPrompt = (isBrainMode?: boolean) => {
  return isBrainMode
    ? `${AGENT_SYSTEM_PROMPT}\n\n[BRAIN MODE ENABLED]: Use deep reasoning and analyze context thoroughly.`
    : AGENT_SYSTEM_PROMPT;
};

const summarize = (result: Record<string, unknown>): string => {
  if (typeof result.error === 'string') return result.error;
  if (typeof result.message === 'string') return result.message;
  const list = Object.values(result).find(Array.isArray) as unknown[] | undefined;
  return list ? `${list.length} result${list.length === 1 ? '' : 's'}` : 'done';
};

export async function processAgenticRequest(
  userQuery: string,
  userId: string,
  options?: { isBrainMode?: boolean; onEvent?: (e: AgentEvent) => void }
): Promise<AgentResponse> {
  const emit = options?.onEvent ?? (() => {});
  const toolsUsed: string[] = [];
  const citations: SourceCitation[] = [];
  const steps: AgentStep[] = [];
  const pendingActions: PendingAction[] = [];
  const record = (s: AgentStep) => { steps.push(s); emit(s); };
  const done = (message: string): AgentResponse => ({ message, sources: citations, toolsUsed, steps, pendingActions });

  try {
    const context = PURE_ACTION.test(userQuery) ? [] : await cachedContext(userId, userQuery);
    context.filter(c => c.similarity > 0.7).forEach(c => citations.push({
      id: c.sourceId,
      sourceType: c.sourceType,
      title: (c.metadata.title as string) || 'Untitled',
      content: c.content,
      similarity: c.similarity
    }));

    const systemPrompt = getSystemPrompt(options?.isBrainMode);
    const contents: GeminiContent[] = [{ role: 'user', parts: [{ text: buildAugmentedPrompt(context, userQuery) }] }];

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      let streamed = '';
      const parts = await streamGeminiWithTools(contents, AGENT_TOOLS, systemPrompt, chunk => {
        streamed += chunk;
        emit({ type: 'token', text: chunk });
      });

      const calls = parts.filter(p => p.functionCall);

      // No tool calls: the streamed text is the final answer.
      if (calls.length === 0) {
        const text = parts.map(p => p.text ?? '').join('').trim();
        return done(text || "I've processed your request. How else can I help?");
      }

      // Text alongside tool calls is the model's plan: promote it from the answer draft to a thinking step.
      if (streamed.trim()) {
        emit({ type: 'reset_draft' });
        record({ type: 'thinking', text: streamed.trim() });
      }

      contents.push({ role: 'model', parts });
      const responses: GeminiPart[] = [];

      for (const { functionCall } of calls) {
        const { name, args = {} } = functionCall!;
        toolsUsed.push(name);
        record({ type: 'tool_call', name, args });

        const result = await executeTool(name, args, userId);
        record({ type: 'tool_result', name, ok: !result.error, summary: summarize(result) });

        if (MUTATING.test(name) && !result.error) ragCache.clear();
        if (result.pending) pendingActions.push(result.pending as PendingAction);

        if (name === 'search_knowledge_base' && Array.isArray(result.results)) {
          for (const r of result.results as Array<{ id: string; source: SourceCitation['sourceType']; content?: string; similarity: number }>) {
            if (citations.some(c => c.id === r.id)) continue;
            citations.push({
              id: r.id,
              sourceType: r.source,
              title: r.content ? r.content.split('\n')[0].replace(/^(Title|Task|Event): /, '') : 'Untitled',
              content: r.content || '',
              similarity: r.similarity
            });
          }
        }

        responses.push({ functionResponse: { name, response: result } });
      }

      contents.push({ role: 'user', parts: responses });
    }

    return done("I've processed your request but reached the step limit. How else can I help?");
  } catch {
    const fallback = await callOpenRouterAPI(userQuery, getSystemPrompt(options?.isBrainMode));
    emit({ type: 'token', text: fallback });
    toolsUsed.push('fallback_openrouter'); // Log fallback status.
    return { message: fallback, sources: [], toolsUsed, steps: [], pendingActions: [] };
  }
}
