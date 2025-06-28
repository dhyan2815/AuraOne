// utils/generateQwenResponse.ts
export const generateQwenResponse = async (prompt: string, retries = 1): Promise<string> => {
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "qwen2.5-coder:1.5b",
        stream: false,
        prompt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data.response.trim();
  } catch (error) {
    if (retries > 0) {
      console.warn("Retrying due to error:", error);
      return generateQwenResponse(prompt, retries - 1);
    }
    throw new Error("LLM response generation failed.");
  }
};
