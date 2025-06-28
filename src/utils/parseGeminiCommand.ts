// utils/parseGeminiCommand.ts

export function parseGeminiCommand(input: string): {
  action: string;
  payload: any;
} {
  const text = input.toLowerCase();

  // Create Note
  if (text.startsWith("create note")) {
    const match = text.match(/create note titled? (.+)/i);
    return {
      action: "createNote",
      payload: { title: match?.[1]?.trim() || "Untitled Note" },
    };
  }

  // Delete Note
  if (text.startsWith("delete note")) {
    const match = text.match(/delete note (.+)/i);
    return {
      action: "deleteNote",
      payload: { id: match?.[1]?.trim() },
    };
  }

  // Create Task
  if (text.startsWith("create task")) {
    const match = text.match(/create task (.+)/i);
    return {
      action: "createTask",
      payload: { title: match?.[1]?.trim() || "Untitled Task" },
    };
  }

  // Delete Task
  if (text.startsWith("delete task")) {
    const match = text.match(/delete task (.+)/i);
    return {
      action: "deleteTask",
      payload: { id: match?.[1]?.trim() },
    };
  }

  // List Tasks
  if (text.includes("list tasks") || text.includes("show tasks")) {
    return {
      action: "listTasks",
      payload: {},
    };
  }

  // Create Event
  if (text.startsWith("create event")) {
    const match = text.match(/create event (.+)/i);
    return {
      action: "createEvent",
      payload: { title: match?.[1]?.trim() || "Untitled Event" },
    };
  }

  // Delete Event
  if (text.startsWith("delete event")) {
    const match = text.match(/delete event (.+)/i);
    return {
      action: "deleteEvent",
      payload: { id: match?.[1]?.trim() },
    };
  }

  return { action: "default", payload: { input } };
}