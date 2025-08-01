// utils/parsePrompt.ts

export async function parsePrompt(prompt: string): Promise<{
  action: string;
  entity: string;
  data: any;
}> {
  const response = await fetch("http://localhost:3001/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Parse the following command into JSON format with fields: action (create/read/update/delete), entity (task/note/event), data (with relevant fields like title, time, content): ${prompt}`,
    }),
  });
  const result = await response.json();
  return JSON.parse(result.response);
}
