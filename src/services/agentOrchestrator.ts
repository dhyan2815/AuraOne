import { callGeminiWithTools, callOpenRouterAPI } from './llmService';
import { AGENT_TOOLS, executeTool } from './agentTools';
import { AGENT_SYSTEM_PROMPT, buildAugmentedPrompt } from './agentPrompts';
import { retrieveContext } from './ragRetrievalService';

export interface AgentResponse {
  message: string;
  sources: SourceCitation[];
  toolsUsed: string[];
}

export interface SourceCitation {
  id: string;
  sourceType: 'note' | 'task' | 'event';
  title: string;
  content: string;
  similarity: number;
}

/**
 * The ReAct (Reason + Act) loop - the brain of the agentic system.
 */
export async function processAgenticRequest(
  userQuery: string,
  userId: string,
  options?: { isBrainMode?: boolean }
): Promise<AgentResponse> {
  const toolsUsed: string[] = [];
  const citations: SourceCitation[] = [];

  try {
    // 1. Initial Retrieval (Pre-fetch context to enrich the first prompt)
    const initialContext = await retrieveContext(userId, userQuery, 5);
    
    // Add initial context to citations if highly relevant
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

    const systemPrompt = options?.isBrainMode 
      ? `${AGENT_SYSTEM_PROMPT}\n\n[BRAIN MODE ENABLED]: Use deep reasoning and analyze context thoroughly.` 
      : AGENT_SYSTEM_PROMPT;

    let currentPrompt = buildAugmentedPrompt(initialContext, userQuery);
    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      iterations++;

      // 2. Call Gemini with Tool support
      const response = await callGeminiWithTools(currentPrompt, AGENT_TOOLS, systemPrompt);

      // 3. Handle Tool Calls or Direct Text
      const part = response.parts?.[0];

      if (part?.functionCall) {
        const { name, args } = part.functionCall;
        toolsUsed.push(name);

        // Execute the tool
        const result = await executeTool(name, args || {}, userId);

        // If it was a search, update citations
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

        // Feed result back to the model
        currentPrompt += `\n[Tool Output for ${name}]: ${JSON.stringify(result)}\n\nBased on this, what is the next step?`;
        continue;
      }

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
    // Fallback to OpenRouter (non-agentic but resilient)
    const systemPromptFallback = options?.isBrainMode 
      ? `${AGENT_SYSTEM_PROMPT}\n\n[BRAIN MODE ENABLED]: Use deep reasoning.` 
      : AGENT_SYSTEM_PROMPT;
    const fallbackResponse = await callOpenRouterAPI(userQuery, systemPromptFallback);
    return {
      message: fallbackResponse,
      sources: [],
      toolsUsed: ['fallback_openrouter']
    };
  }
}
