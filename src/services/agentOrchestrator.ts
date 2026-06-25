// ReAct Agentic Orchestrator — Core agent reasoning loop that executes tool calls, manages context, and handles fallbacks.

import { callGeminiWithTools, callOpenRouterAPI } from './llmService';
import { AGENT_TOOLS, executeTool } from './agentTools';
import { AGENT_SYSTEM_PROMPT, buildAugmentedPrompt } from './agentPrompts';
import { retrieveContext } from './ragRetrievalService';

// Structure of the agent's finalized reply including source citations and executed tools.
export interface AgentResponse {
  message: string; // The text content of the agent's response.
  sources: SourceCitation[]; // Documents and chunks used to formulate the response.
  toolsUsed: string[]; // Names of the functions executed during processing.
}

// Representation of a context citation shown in the chat UI.
export interface SourceCitation {
  id: string; // Parent entity UUID.
  sourceType: 'note' | 'task' | 'event';
  title: string;
  content: string;
  similarity: number;
}

// Process user queries using a multi-step Reason + Act loop with parallel tool executions.
export async function processAgenticRequest(
  userQuery: string,
  userId: string,
  options?: { isBrainMode?: boolean }
): Promise<AgentResponse> {
  const toolsUsed: string[] = [];
  const citations: SourceCitation[] = [];

  try {
    // Retrieve semantic context matching the prompt to prime the agent.
    const initialContext = await retrieveContext(userId, userQuery, 5);
    
    // Catalog context chunks as citations if similarity is highly relevant.
    initialContext.forEach(ctx => {
      if (ctx.similarity > 0.7) {
        citations.push({
          id: ctx.sourceId,
          sourceType: ctx.sourceType,
          title: (ctx.metadata.title as string) || 'Untitled',
          content: ctx.content,
          similarity: ctx.similarity
        });
      }
    });

    // Augment the system prompt if deep-reasoning Brain Mode is toggled.
    const systemPrompt = options?.isBrainMode 
      ? `${AGENT_SYSTEM_PROMPT}\n\n[BRAIN MODE ENABLED]: Use deep reasoning and analyze context thoroughly.` 
      : AGENT_SYSTEM_PROMPT;

    let currentPrompt = buildAugmentedPrompt(initialContext, userQuery);
    let iterations = 0;
    const maxIterations = 5;

    // Loop until final answer is generated or iteration threshold is reached.
    while (iterations < maxIterations) {
      iterations++;

      // Request next action (text response or tool call) from Gemini.
      const response = await callGeminiWithTools(currentPrompt, AGENT_TOOLS, systemPrompt);

      const part = response.parts?.[0];

      // Execute tool if function-call parameters are returned by the model.
      if (part?.functionCall) {
        const { name, args } = part.functionCall;
        toolsUsed.push(name);

        const result = await executeTool(name, args || {}, userId);

        // Parse search results to dynamically add new citations.
        if (name === 'search_knowledge_base' && result.results && Array.isArray(result.results)) {
          result.results.forEach((r: { id: string; source: 'note' | 'task' | 'event'; content?: string; similarity: number }) => {
            if (!citations.find(c => c.id === r.id)) {
              citations.push({
                id: r.id,
                sourceType: r.source,
                title: r.content ? r.content.split('\n')[0].replace('Title: ', '').replace('Task: ', '').replace('Event: ', '') : 'Untitled',
                content: r.content || '',
                similarity: r.similarity
              });
            }
          });
        }

        // Append tool execution logs back into the conversation context for the next decision.
        currentPrompt += `\n[Tool Output for ${name}]: ${JSON.stringify(result)}\n\nBased on this, what is the next step?`;
        continue;
      }

      // Return text answer immediately once agent determines task is resolved.
      if (part?.text) {
        return {
          message: part.text,
          sources: citations,
          toolsUsed
        };
      }

      break;
    }

    return {
      message: "I've processed your request but reached an iteration limit. How else can I help?",
      sources: citations,
      toolsUsed
    };

  } catch {
    // Fall back to OpenRouter reasoning models on API rate limit or context failure.
    const systemPromptFallback = options?.isBrainMode 
      ? `${AGENT_SYSTEM_PROMPT}\n\n[BRAIN MODE ENABLED]: Use deep reasoning.` 
      : AGENT_SYSTEM_PROMPT;
    const fallbackResponse = await callOpenRouterAPI(userQuery, systemPromptFallback);
    return {
      message: fallbackResponse,
      sources: [],
      toolsUsed: ['fallback_openrouter'] // Log fallback status.
    };
  }
}
