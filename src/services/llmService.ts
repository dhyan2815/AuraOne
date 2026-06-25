// LLM API client service — Interfaces with Gemini and OpenRouter APIs to handle generation, function calling, and timeouts.

import { getAIConfig } from '../config/api';

const AI_CONFIG = getAIConfig();

// Define execution constraints, retries, and timing limits for API calls.
export const SERVICE_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 15000, // 15-second timeout for primary API calls.
  BACKOFF_MS: 2000,
};

// Dispatch a plaintext content generation request to the Gemini API.
export async function callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
  const LOCATION = "src/services/llmService.ts:callGeminiAPI";
  if (!AI_CONFIG.gemini.enabled) {
    throw new Error(`[${LOCATION}] Gemini API not configured`);
  }

  // Set up an abort controller to prevent hanging request.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_CONFIG.TIMEOUT_MS);

  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\n\nAura:` : prompt;

    const response = await fetch(
      `${AI_CONFIG.gemini.apiUrl}/models/${AI_CONFIG.gemini.model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.1, // Use low temperature for high determinism.
            maxOutputTokens: 2000,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`[${LOCATION}] Gemini API error: ${response.status} - ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error(`[${LOCATION}] No response candidate from Gemini`);
    }

    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`[${LOCATION}] Gemini Hub Timeout`);
    }
    throw error;
  }
}

// Call Gemini API with tool definitions to perform function calling.
export async function callGeminiWithTools(
  prompt: string, 
  tools: Array<{ name: string; description: string; parameters: Record<string, unknown> }>, 
  systemPrompt?: string
): Promise<{ parts: Array<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }> }> {
  const LOCATION = "src/services/llmService.ts:callGeminiWithTools";
  if (!AI_CONFIG.gemini.enabled) {
    throw new Error(`[${LOCATION}] Gemini API not configured`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_CONFIG.TIMEOUT_MS);

  try {
    const contents = [];
    if (systemPrompt) {
      // Prepend system instructions to user prompt for backward compatibility.
      contents.push({ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] });
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await fetch(
      `${AI_CONFIG.gemini.apiUrl}/models/${AI_CONFIG.gemini.model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          tools: [{ function_declarations: tools }],
          tool_config: {
            function_calling_config: {
              mode: "AUTO", // Allow model to choose when to invoke tools.
            },
          },
          generationConfig: {
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`[${LOCATION}] Gemini Tool API error: ${response.status} - ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Call OpenRouter API as a fallback when Gemini is unavailable or rate-limited.
export async function callOpenRouterAPI(prompt: string, systemPrompt?: string): Promise<string> {
  const LOCATION = "src/services/llmService.ts:callOpenRouterAPI";
  
  if (!AI_CONFIG.openRouter.enabled) {
    throw new Error(`[${LOCATION}] Open Router API not configured`);
  }

  // Extend fallback timeout limit as reasoning models might take longer.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_CONFIG.TIMEOUT_MS * 3);

  try {
    const activeModel = AI_CONFIG.openRouter.model || 'openrouter/free';
    const activeSystemPrompt = systemPrompt || 'You are Aura, a professional and helpful assistant.';
    
    const response = await fetch(AI_CONFIG.openRouter.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openRouter.apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AuraOne',
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: activeSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`[llmService] Open Router HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      throw new Error(`[llmService] Invalid Open Router response format`);
    }

    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`[llmService] Reasoning Matrix Timeout`);
    }
    throw error;
  }
}
