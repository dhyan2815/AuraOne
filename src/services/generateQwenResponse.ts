// utils/generateQwenResponse.ts

/**
 * Calls the LLM endpoint to generate a response for a given prompt.
 * Adds timeout, improved error handling, response validation, and logging.
 * Allows model/endpoint override for future flexibility.
 */
export const generateQwenResponse = async (
  prompt: string,
  retries = 1,
  options?: {
    model?: string;
    endpoint?: string;
    timeoutMs?: number;
  }
): Promise<string> => {
  const model = options?.model || "qwen2.5-coder:1.5b";
  const endpoint = options?.endpoint || "http://localhost:11434/api/generate";
  const timeoutMs = options?.timeoutMs || 15000; // 15s default timeout

  // Helper for fetch with timeout
  function fetchWithTimeout(resource: RequestInfo, options: any = {}) {
    const { timeout = timeoutMs } = options;
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  }

  try {
    const res: any = await fetchWithTimeout(endpoint, {
      method: "POST",
      body: JSON.stringify({
        model,
        stream: false,
        prompt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      timeout: timeoutMs,
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      console.error("❌ Failed to parse LLM HTTP response as JSON:", jsonErr, prompt);
      throw new Error("LLM response was not valid JSON.");
    }

    // Validate response
    if (!data || typeof data.response !== "string" || !data.response.trim()) {
      console.error("❌ LLM returned empty or malformed response:", data, prompt);
      return "Sorry, I couldn't generate a response. Please try again.";
    }

    return data.response.trim();
  } catch (error) {
    console.error("❌ LLM fetch error (will retry if possible):", error, prompt);
    if (retries > 0) {
      return generateQwenResponse(prompt, retries - 1, options);
    }
    return "Sorry, I couldn't generate a response. Please try again.";
  }
};
