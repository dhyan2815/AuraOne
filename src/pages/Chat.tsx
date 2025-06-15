import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { generateGeminiResponse } from "../config/api";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "users", user.uid, "chats");
    const q = query(messagesRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      );
    });

    return unsubscribe;
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const messagesRef = collection(db, "users", user.uid, "chats");

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    await addDoc(messagesRef, {
      ...userMessage,
      createdAt: serverTimestamp(),
    });

    setInput("");

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
              {/* <div className="text-center"> */}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Start a conversation with Aura!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                Ask me anything! I'm here to help you with questions, creative
                tasks, or just have a friendly chat.
              </p>
              {/* </div> */}
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
                    className={`max-w-[75%] p-2 rounded-xl text-[14px] leading-snug ${msg.role === "user"
                      ? "bg-primary-600 text-white rounded-br-md"
                      : "bg-white text-slate-900 dark:text-slate-100 dark:bg-gray-700 border-slate-200 rounded-bl-md"
                      }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
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
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl rounded-bl-md px-3 py-2 text-[15px] leading-snug">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
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

      {/* Input */}
      <div className="dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-1 py-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
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