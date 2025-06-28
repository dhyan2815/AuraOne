// utils/parseQwenCommand.ts
export const parseQwenCommand = async (userPrompt: string) => {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "qwen2.5-coder:1.5b",
      stream: false,
      prompt: `
You are a helpful assistant named Aura. You help manage tasks, notes, and events.

Respond ONLY in raw JSON (no markdown or extra explanation). Do not wrap in triple backticks.

Ensure your JSON contains:
- "action": string (e.g. "deleteEvent", "createTask", "createNote", "updateTask",)
- "payload": object

User Prompt: ${JSON.stringify(userPrompt)}
      `.trim(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  let cleaned = data.response.trim();

  try {
    // Remove backticks or any markdown artifacts
    cleaned = cleaned.replace(/```json|```/g, "").trim();

    // Try parsing the JSON
    const json = JSON.parse(cleaned);

    if (!json.action || !json.payload) {
      throw new Error("Missing action or payload.");
    }

    return json;
  } catch (err) {
    console.error("❌ Failed to parse LLM response:", cleaned);
    throw new Error(`Failed to parse JSON: ${err}`);
  }
};