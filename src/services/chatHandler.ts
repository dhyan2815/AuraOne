// /services/chatHandler.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import * as chrono from 'chrono-node';
import { createNote, deleteNote } from "../hooks/useNotes";
import { addTask, deleteTask, getTasks } from "../hooks/useTasks";
import { getEvents, addEvent, deleteEvent } from "../hooks/useEvents";
import { generateQwenResponse } from "./generateQwenResponse"; 
import { parseQwenCommand } from "../utils/parseQwenCommand";

/**
 * Handles a specific action and payload, performing CRUD or other logic.
 * Returns a result string for the user.
 */
async function handleAction(action: string, payload: any, user: any) {
  switch (action) {
    case "createNote":
      if (!payload.title || !payload.content) {
        throw new Error("Missing title or content for note.");
      }
      await createNote(user.uid, {
        title: payload.title,
        content: payload.content || "",
        createdAt: new Date().toISOString(),
        tag: [],
      });
      return `Note \"${payload.title}\" created ✅`;

    case "deleteNote":
      await deleteNote(user.uid, payload.id);
      return `Note deleted 🗑️`;

    case "createTask": {
      const parsedDate = chrono.parseDate(payload.datetime || "");
      await addTask(user.uid, {
        title: payload.title,
        description: payload.description || "",
        dueDate: parsedDate ? format(parsedDate, "yyyy-MM-dd") : "",
        dueTime: parsedDate ? format(parsedDate, "HH:mm") : "",
        completed: "due",
        priority: "medium",
      });
      return `Task \"${payload.title}\" added for ${parsedDate ? format(parsedDate, "PPpp") : "unspecified time"} ✅`;
    }

    case "deleteTask":
      await deleteTask(user.uid, payload.id);
      return `Task deleted 🗑️`;

    case "listTasks": {
      const tasks = await getTasks(user.uid);
      return tasks.length === 0
        ? "No tasks found 📭"
        : "Your Tasks:\n" + tasks.map((t) => `- ${t.title}`).join("📝 \n");
    }

    case "addEvent": {
      const parsedDate = chrono.parseDate(payload.datetime || "");
      if (!parsedDate) throw new Error("Could not parse date.");
      await addEvent(
        user.uid,
        payload.title,
        format(parsedDate, "HH:mm"),
        parsedDate
      );
      return `Event \"${payload.title}\" created for ${format(parsedDate, "PPpp")} ✅`;
    }

    case "deleteEvent":
      await deleteEvent(user.uid, payload.id);
      return `Event deleted 🗑️`;

    case "getEvents": {
      const events = await getEvents(user.uid);
      return events.length === 0
        ? "No events found 🗓️"
        : "Your Events:\n" + events.map((e) => `- ${e.title}`).join(" 🗓️ \n");
    }

    // Add more actions here as needed

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Main orchestrator for handling a user message: detects intent, performs action or general chat, and stores results.
 */
export const handleSendMessage = async ({
  input,
  user,
  selectedSession,
  db,
  setInput,
  setLoading,
  setLoadingTimer,
  loadingTimer,
}: {
  input: string;
  user: any;
  selectedSession: string | null;
  db: any;
  setInput: (val: string) => void;
  setLoading: (val: boolean) => void;
  setLoadingTimer: (timer: NodeJS.Timeout | null) => void;
  loadingTimer: NodeJS.Timeout | null;
}) => {
  if (!input.trim() || !user || !selectedSession) return;

  const content = input.trim();
  const messagesRef = collection(
    db,
    "users",
    user.uid,
    "sessions",
    selectedSession,
    "messages"
  );

  const userMessage = { role: "user", content };

  await addDoc(messagesRef, {
    ...userMessage,
    createdAt: serverTimestamp(),
  });

  setInput("");

  const timer = setTimeout(() => setLoading(true), 300);
  setLoadingTimer(timer);

  try {
    // Step 1: Try to parse as an actionable command
    const { action, payload } = await parseQwenCommand(content);

    let resultText = "";
    if (action) {
      // Step 2: Handle the action
      try {
        resultText = await handleAction(action, payload, user);
      } catch (actionErr) {
        console.error("❌ Error in action handler:", actionErr);
        let errorMsg = "Could not perform the requested action.";
        if (typeof actionErr === "object" && actionErr && "message" in actionErr) {
          errorMsg = (actionErr as any).message || errorMsg;
        }
        resultText = `Error: ${errorMsg} ⚠️`;
      }
    } else {
      // Step 3: Fallback to general chat/LLM
      try {
        resultText = await generateQwenResponse(content);
      } catch (llmErr) {
        console.error("❌ Error in LLM response:", llmErr);
        resultText = "Error: I couldn't process your request ⚠️";
      }
    }

    const aiMessage = { role: "ai", content: resultText };
    await addDoc(messagesRef, {
      ...aiMessage,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ Unexpected error in handleSendMessage:", error);
    await addDoc(messagesRef, {
      role: "ai",
      content: "Error: I couldn't process your request ⚠️",
      createdAt: serverTimestamp(),
    });
  } finally {
    setLoading(false);
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      setLoadingTimer(null);
    }
  }
};
