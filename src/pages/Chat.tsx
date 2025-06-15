import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Bot, User, SquarePen, Trash2 } from "lucide-react";
import { generateGeminiResponse } from "../config/api";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  setDoc,
  query,
  orderBy,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

type Message = {
  id?: string;
  role: "user" | "ai";
  content: string;
  createdAt?: any;
};

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages from Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;

    const sessionsRef = collection(db, "users", user.uid, "sessions");
    getDocs(sessionsRef).then((snapshot) => {
      const sessionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || `Chat ${doc.id}`,
      }));
      setSessions(sessionList);

      // Select the first session automatically
      if (sessionList.length > 0 && !selectedSession) {
        setSelectedSession(sessionList[0].id);
      }
    });
  }, [user]);

  // listens for messages in the current session
  useEffect(() => {
    if (!user || !selectedSession) return;

    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "sessions",
      selectedSession,
      "messages"
    );

    const q = query(messagesRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      );
    });

    return unsubscribe;
  }, [user, selectedSession]);

  // Function to handle sending messages
  const handleSend = async () => {
    if (!input.trim() || !user || !selectedSession) return;

    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "sessions",
      selectedSession,
      "messages"
    );

    // Create a user message object
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    // Clear the input field
    await addDoc(messagesRef, {
      ...userMessage,
      createdAt: serverTimestamp(),
    });

    setInput("");

    // Clear any existing loading timer
    const timer = setTimeout(() => {
      setLoading(true);
    }, 300) //300ms delay
    setLoadingTimer(timer);

    try {
      const aiResponse = await generateGeminiResponse(userMessage.content);

      const aiMessage: Message = {
        role: "ai",
        content: aiResponse,
      };

      await addDoc(messagesRef, {
        ...aiMessage,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error generating AI response:", error);

      // Add an error message to the chat
      const errorMessage: Message = {
        role: "ai",
        content: "Sorry, I couldn't process your request. Please try again later.",
      };
      await addDoc(messagesRef, {
        ...errorMessage,
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

  // function for creating a new session
  const createNewSession = async () => {
    if (!user) return;

    const newSessionRef = doc(collection(db, "users", user.uid, "sessions"));
    const sessionId = newSessionRef.id;
    const sessionName = `Chat ${sessions.length + 1}`;

    await setDoc(newSessionRef, {
      name: sessionName,
      createdAt: serverTimestamp(),
    });

    setSessions((prev) => [...prev, { id: sessionId, name: sessionName }]);
    setSelectedSession(sessionId);
    setMessages([]);
    setInput("");
  };

  // function to delete current session
  const deleteCurrentSession = async () => {
    if (!user || !selectedSession) return;

    // Confirm deletion
    const confirmed = window.confirm("Are you sure you want to delete this session?");
    toast.success("Session deleted successfully!")
    if (!confirmed) return;

    try {
      // 1. Delete all messages in the session
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

      // 2. Delete the session document
      const sessionRef = doc(db, "users", user.uid, "sessions", selectedSession);
      await deleteDoc(sessionRef);

      // 3. Update local state
      const updatedSessions = sessions.filter((s) => s.id !== selectedSession);
      setSessions(updatedSessions);

      // 4. Switch to another session (if any), or clear
      if (updatedSessions.length > 0) {
        setSelectedSession(updatedSessions[0].id);
      } else {
        setSelectedSession(null);
        setMessages([]);
      }

      setInput("");
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  // function to render clean plain text 
  function cleanTextOnly(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")   // remove bold
      .replace(/^\s*\*\s+/gm, "- ")       // replace * bullets with dashes
      .replace(/\n{2,}/g, "\n\n")         // normalize new lines
      .trim();
  }

  // If auth is loading, show a loading spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] dark:bg-slate-800">
      {/* Header */}
      <div className="flex justify-center dark:bg-slate-800 dark:border-slate-700 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex justify-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md flex justify-center items-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Aura Assistant
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your AI companion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-2 py-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Start a conversation with Aura!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                  Ask me anything! I'm here to help you with questions, creative
                  tasks, or just have a friendly chat.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-4 h-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mt-1">
                      <Sparkles className="w-[15px] h-[15px] text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-2 rounded-xl text-[16px] leading-snug ${msg.role === "user"
                      ? "bg-primary-600 text-white rounded-br-md"
                      : "bg-gray-100 text-slate-900 dark:text-slate-100 dark:bg-gray-700 border-slate-200 rounded-bl-md"
                      }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {cleanTextOnly(msg.content)}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-4 h-4 bg-slate-600 dark:bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-[14px] h-[14px] text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-[14px] h-[14px] text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl rounded-bl-md px-1 py-1 text-[15px] leading-snug">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-500 ml-2">
                        Aura is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="px-1 py-1">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end gap-3">

            {/* New Chat Session */}
            <div className="mb-1 w-2/9">
              <button
                onClick={createNewSession}
                className="w-full px-1 py-1 dark:border-slate-600 rounded-lg text-base text-slate-900 dark:text-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SquarePen size={22} />
              </button>
            </div>

            {/* Delete current Chat Session */}
            <div className="mb-1 w-2/9">
              <button
                onClick={deleteCurrentSession}
                className="w-full px-1 py-1 dark:border-slate-600 rounded-lg text-base text-slate-900 dark:text-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={21} />
              </button>
            </div>

            {/* Chat Sessions */}
            <div className="mb-1 w-2/9">
              <select
                className="w-full px-1 py-1 dark:bg-slate-800 rounded-lg text-base text-slate-900 dark:text-white"
                value={selectedSession ?? ""}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                <option value="" disabled>Select Chat</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input */}
            <div className="flex-1 w-4/9">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                className="w-full px-1 py-1 mt-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-base placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-1 py-1 mb-1 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
            >
              <Send size={21} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;