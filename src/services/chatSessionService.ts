// services/chatSessionService.ts

import {
  collection,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

type Session = { id: string; name: string };

// Generate a meaningful session name from the first message
const generateSessionName = (firstMessage: string): string => {
  // Clean and truncate the message
  const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
  
  // If it's a short message, use it directly
  if (cleanMessage.length <= 30) {
    return cleanMessage;
  }
  
  // For longer messages, take the first meaningful part
  const words = cleanMessage.split(' ');
  let name = '';
  
  for (const word of words) {
    if ((name + ' ' + word).length <= 30) {
      name += (name ? ' ' : '') + word;
    } else {
      break;
    }
  }
  
  return name + (name.length < cleanMessage.length ? '...' : '');
};

// Generate a fallback name for sessions without meaningful content
const generateFallbackName = (sessionId: string): string => {
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `Chat ${timestamp}`;
};

// Update session name based on conversation content
export const updateSessionName = async (
  db: any,
  user: any,
  sessionId: string,
  firstMessage: string
) => {
  if (!user || !sessionId) return;

  try {
    const sessionName = generateSessionName(firstMessage);
    const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
    
    await updateDoc(sessionRef, {
      name: sessionName,
    });
    
    return sessionName;
  } catch (error) {
    console.error("Failed to update session name:", error);
    return null;
  }
};

// Update session name with fallback for existing sessions
export const updateSessionNameWithFallback = async (
  db: any,
  user: any,
  sessionId: string,
  firstMessage?: string
) => {
  if (!user || !sessionId) return;

  try {
    let sessionName: string;
    
    // Only use fallback if no firstMessage is provided
    if (firstMessage && firstMessage.trim().length > 0) {
      sessionName = generateSessionName(firstMessage);
    } else {
      // Only use fallback for truly old sessions, not new ones
      sessionName = generateFallbackName(sessionId);
    }
    
    const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
    
    await updateDoc(sessionRef, {
      name: sessionName,
    });
    
    return sessionName;
  } catch (error) {
    console.error("Failed to update session name:", error);
    return null;
  }
};

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
  const sessionName = "New Chat"; // Start with a simple name

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
