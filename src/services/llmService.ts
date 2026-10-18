// LLM API client service — Interfaces with Gemini and OpenRouter APIs to handle generation, function calling, and timeouts.

import { getAIConfig } from '../config/api';

const AI_CONFIG = getAIConfig();

// Define execution constraints, retries, and timing limits for API calls.
export const SERVICE_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 15000, // 15-second timeout for primary API calls.
  BACKOFF_MS: 2000,
};



async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Dispatch a plaintext content generation request to the Gemini API.
export async function callGeminiAPI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!AI_CONFIG.gemini.enabled) {
    throw new Error(`[llmService] Gemini API not configured`);
  }

  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\n\nAura:` : prompt;

    const response = await fetchWithTimeout(
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
      },
      SERVICE_CONFIG.TIMEOUT_MS
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`[llmService] Gemini API error: ${response.status} - ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error(`[llmService] No response candidate from Gemini`);
    }

    return text.trim();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`[llmService] Gemini Hub Timeout`);
    }
    throw error;
  }
}

// One Gemini conversation turn: user text, model output (text and/or function calls), or function results.
export type GeminiPart = {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
};
export type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

// Stream one model turn over SSE, calling onText per token; returns the merged parts (text + any function calls).
export async function streamGeminiWithTools(
  contents: GeminiContent[],
  tools: Array<{ name: string; description: string; parameters: Record<string, unknown> }>,
  systemPrompt: string,
  onText?: (chunk: string) => void
): Promise<GeminiPart[]> {
  if (!AI_CONFIG.gemini.enabled) {
    throw new Error(`[llmService] Gemini API not configured`);
  }

  const response = await fetchWithTimeout(
    `${AI_CONFIG.gemini.apiUrl}/models/${AI_CONFIG.gemini.model}:streamGenerateContent?alt=sse&key=${AI_CONFIG.gemini.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        tools: [{ function_declarations: tools }],
        tool_config: { function_calling_config: { mode: 'AUTO' } },
        generationConfig: { temperature: 0.2 },
      }),
    },
    SERVICE_CONFIG.TIMEOUT_MS * 2
  );

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`[llmService] Gemini Stream error: ${response.status} - ${errorData.error?.message || ''}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const calls: GeminiPart[] = [];
  let text = '';
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const json = line.slice(5).trim();
      if (!json) continue;
      for (const part of JSON.parse(json).candidates?.[0]?.content?.parts ?? []) {
        if (part.functionCall) calls.push({ functionCall: part.functionCall });
        else if (part.text) { text += part.text; onText?.(part.text); }
      }
    }
  }

  return [...(text ? [{ text }] : []), ...calls];
}

// Call OpenRouter API as a fallback when Gemini is unavailable or rate-limited.
export async function callOpenRouterAPI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!AI_CONFIG.openRouter.enabled) {
    throw new Error(`[llmService] Open Router API not configured`);
  }

  try {
    const activeModel = AI_CONFIG.openRouter.model || 'openrouter/free';
    const activeSystemPrompt = systemPrompt || 'You are Aura, a professional and helpful assistant.';
    
    const response = await fetchWithTimeout(AI_CONFIG.openRouter.apiUrl, {
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
    }, SERVICE_CONFIG.TIMEOUT_MS * 3);

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
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`[llmService] Reasoning Matrix Timeout`);
    }
    throw error;
  }
}
