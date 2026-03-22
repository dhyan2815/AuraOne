// src/pages/Chat.tsx
import { Bot, Send, Sparkles, SquarePen, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getSessions,
  createNewSession,
  deleteSession,
  Session,
} from "../services/chatSessionService";
import {
  getMessages,
  handleSendMessage,
  Message,
} from "../services/chatHandler";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Data Fetching and Real-time ---

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const sessionList = await getSessions(user.id);
      setSessions(sessionList);
      if (sessionList.length > 0 && !selectedSession) {
        setSelectedSession(sessionList[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch chat sessions.");
    }
  }, [user, selectedSession]);

  useEffect(() => {
    fetchSessions();
  }, [user, fetchSessions]);

  const fetchMessages = useCallback(async () => {
    if (!selectedSession) {
      setMessages([]);
      return;
    };
    try {
      const messageList = await getMessages(selectedSession);
      setMessages(messageList);
    } catch (error) {
      toast.error("Failed to fetch messages.");
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time message updates
    const channel = supabase
      .channel(`chat-messages-${selectedSession}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${selectedSession}` },
        (payload) => {
          setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession, fetchMessages]);

  useEffect(scrollToBottom, [messages]);


  // --- Event Handlers ---

  const handleSend = async () => {
    if (!user || !selectedSession || !input.trim()) return;

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      await handleSendMessage(currentInput, user, selectedSession);
      // After sending, we need to refresh the session name in case it was the first message
      const updatedSessions = sessions.map(s => s.id === selectedSession ? {...s, name: currentInput.substring(0,40)} : s)
      const session = await getSessions(user.id);
      setSessions(session);

    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSession = async () => {
    if (!user) return;
    try {
      const newSession = await createNewSession(user);
      setSessions([newSession, ...sessions]);
      setSelectedSession(newSession.id);
      setMessages([]);
      setInput("");
      toast.success("New chat created!");
    } catch (error) {
      toast.error("Failed to create new chat.");
    }
  };

  const handleDeleteCurrentSession = async () => {
    if (!selectedSession) return;
    const confirmed = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmed) return;

    try {
      await deleteSession(selectedSession);
      toast.success("Chat deleted successfully!");

      const updatedSessions = sessions.filter(s => s.id !== selectedSession);
      setSessions(updatedSessions);

      if (updatedSessions.length > 0) {
        setSelectedSession(updatedSessions[0].id);
      } else {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error("Failed to delete chat.");
    }
  };

  // --- UI Rendering ---

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header with Session Controls */}
      <div className="flex justify-between items-center px-2 py-2 border-b border-slate-200 dark:border-slate-700">
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

        {/* Session Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewSession}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium"
            title="New Chat"
          >
            <SquarePen size={16} className="inline mr-1" />
            New Chat
          </button>

          <div className="relative">
            <select
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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

          {selectedSession && (
            <button
              onClick={handleDeleteCurrentSession}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              title="Delete Current Chat"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-2 py-2">
          {messages.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Aura Assistant
                </h3>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  How can I help you today?
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-3 rounded-xl text-base leading-snug ${
                      msg.role === "user"
                        ? "bg-primary-600 text-white rounded-br-md"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 bg-slate-600 dark:bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                   <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl rounded-bl-md px-4 py-3 text-base leading-snug">
                    <div className="flex items-center gap-2">
                       <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-1 py-1">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Aura anything..."
              disabled={loading}
              className="w-full pl-4 pr-20 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full text-base placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 resize-none"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
