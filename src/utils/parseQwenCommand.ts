// utils/parseQwenCommand.ts

// Centralized list of valid actions for maintainability
const VALID_ACTIONS = [
  "createNote",
  "deleteNote",
  "updateNote",
  "createTask",
  "deleteTask",
  "updateTask",
  "listTasks",
  "addEvent",
  "deleteEvent",
  "updateEvent",
  "getEvents",
];

/**
 * Attempts to parse a user prompt into an actionable command using the LLM.
 * Returns { action, payload } if a valid action is detected, otherwise { action: null }.
 * Enhanced error handling and logging for reliability.
 */
export const parseQwenCommand = async (userPrompt: string) => {
  // (Future) Local heuristics for obvious commands can go here

  let response;
  try {
    response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "qwen2.5-coder:1.5b",
        stream: false,
        prompt: `\nYou are a helpful assistant named Aura. You help manage tasks, notes, and events.\n\nRespond ONLY in raw JSON (no markdown or extra explanation). Do not wrap in triple backticks.\n\nEnsure your JSON contains:\n- \"action\": string (e.g. \"deleteEvent\", \"createTask\", \"createNote\", \"updateTask\",)\n- \"payload\": object\n\nUser Prompt: ${JSON.stringify(userPrompt)}\n        `.trim(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (networkErr) {
    console.error("❌ Network error calling LLM:", networkErr);
    return { action: null };
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    console.error("❌ Failed to parse LLM HTTP response as JSON:", jsonErr);
    return { action: null };
  }

  let cleaned = (data.response || "").trim();

  try {
    // Remove backticks or any markdown artifacts
    cleaned = cleaned.replace(/```json|```/g, "").trim();

    // Try parsing the JSON
    const json = JSON.parse(cleaned);

    if (!json.action || !json.payload) {
      throw new Error("Missing action or payload.");
    }

    // Validate action
    if (!VALID_ACTIONS.includes(json.action)) {
      console.warn(`⚠️ Unrecognized action from LLM: ${json.action}`);
      return { action: null };
    }

    return json;
  } catch (err) {
    console.error("❌ Failed to parse LLM response as valid JSON command:", cleaned, err);
    return { action: null };
  }
};