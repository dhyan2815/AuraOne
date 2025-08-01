// services/chatSessionService.ts

import {
  collection,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

type Session = { id: string; name: string };

// Create a new session
export const createNewSession = async (
  db: any,
  user: any,
  sessions: { id: string; name: string }[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  setSelectedSession: (id: string) => void,
  setMessages: (msgs: any[]) => void,
  setInput: (val: string) => void
) => {
  if (!user) return;

  const newSessionRef = doc(collection(db, "users", user.uid, "sessions"));
  const sessionId = newSessionRef.id;
  const sessionName = `Chat Session ${sessions.length + 1}`;

  await setDoc(newSessionRef, {
    name: sessionName,
    createdAt: serverTimestamp(),
  });

  setSessions((prev) => [...prev, { id: sessionId, name: sessionName }]);
  setSelectedSession(sessionId);
  setMessages([]);
  setInput("");
  toast.success("New session created successfully!");
};

// Delete an existing session
export const deleteCurrentSession = async (
  db: any,
  user: any,
  selectedSession: string | null,
  sessions: { id: string; name: string }[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  setSelectedSession: (id: string | null) => void,
  setMessages: (msgs: any[]) => void,
  setInput: (val: string) => void
) => {
  if (!user || !selectedSession) return;

  const confirmed = window.confirm("Are you sure you want to delete this session?");
  if (!confirmed) return;

  try {
    // Delete all messages in the session
    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "sessions",
      selectedSession,
      "messages"
    );

    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromises = messagesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Delete the session document
    const sessionRef = doc(db, "users", user.uid, "sessions", selectedSession);
    await deleteDoc(sessionRef);

    // Update local state
    const updatedSessions = sessions.filter((s) => s.id !== selectedSession);
    setSessions(updatedSessions);

    if (updatedSessions.length > 0) {
      setSelectedSession(updatedSessions[0].id);
    } else {
      setSelectedSession(null);
      setMessages([]);
    }

    setInput("");
    toast.success("Session deleted successfully!");
  } catch (error) {
    console.error("Failed to delete session:", error);
  }
};
