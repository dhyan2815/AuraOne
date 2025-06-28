// /services/chatHandler.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import * as chrono from 'chrono-node';
import { createNote, deleteNote } from "../hooks/useNotes";
import { addTask, deleteTask, getTasks } from "../hooks/useTasks";
import { getEvents, addEvent, deleteEvent } from "../hooks/useEvents";
import { generateQwenResponse } from "./generateQwenResponse"; 
import { parseQwenCommand } from "../utils/parseQwenCommand";

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
    const { action, payload } = await parseQwenCommand(content);

    let resultText = "";

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
        resultText = `Note "${payload.title}" created ✅`;
        break;

      case "deleteNote":
        await deleteNote(user.uid, payload.id);
        resultText = `Note deleted 🗑️`;
        break;

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

        resultText = `Task "${payload.title}" added for ${
          parsedDate ? format(parsedDate, "PPpp") : "unspecified time"
        } ✅`;
        break;
      }

      case "deleteTask":
        await deleteTask(user.uid, payload.id);
        resultText = `Task deleted 🗑️`;
        break;

      case "listTasks":
        const tasks = await getTasks(user.uid);
        resultText =
          tasks.length === 0
            ? "No tasks found 📭"
            : "Your Tasks:\n" + tasks.map((t) => `- ${t.title}`).join("📝 \n");
        break;

      case "addEvent":
        const parsedDate = chrono.parseDate(payload.datetime || "");
        if (!parsedDate) throw new Error("Could not parse date.");
        await addEvent(
          user.uid,
          payload.title,
          format(parsedDate, "HH:mm"),
          parsedDate
        );
        resultText = `Event "${payload.title}" created for ${format(
          parsedDate,
          "PPpp"
        )} ✅`;
        break;

      case "deleteEvent":
        await deleteEvent(user.uid, payload.id);
        resultText = `Event deleted 🗑️`;
        break;

      case "getEvents":
        const events = await getEvents(user.uid);
        resultText =
          events.length === 0
            ? "No events found 🗓️"
            : "Your Events:\n" + events.map((e) => `- ${e.title}`).join(" 🗓️ \n");
        break;

      default:
        resultText = await generateQwenResponse(content);
        break;
    }

    const aiMessage = { role: "ai", content: resultText };
    await addDoc(messagesRef, {
      ...aiMessage,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error:", error);
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
