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
import { motion, AnimatePresence } from "framer-motion";

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

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const sessionList = await getSessions(user.id);
      setSessions(sessionList);
      if (sessionList.length > 0 && !selectedSession) {
        setSelectedSession(sessionList[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch sessions");
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
      toast.error("Failed to fetch messages");
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchMessages();
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

  const handleSend = async () => {
    if (!user || !selectedSession || !input.trim()) return;
    const currentInput = input;
    setInput("");
    setLoading(true);
    try {
      await handleSendMessage(currentInput, user, selectedSession);
      const session = await getSessions(user.id);
      setSessions(session);
    } catch (error) {
      toast.error("Failed to send message");
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
      toast.success("New aura initialized");
    } catch (error) {
      toast.error("Initialization failed");
    }
  };

  const handleDeleteCurrentSession = async () => {
    if (!selectedSession) return;
    if (!window.confirm("Archive this conversation?")) return;
    try {
      await deleteSession(selectedSession);
      toast.success("Conversation archived");
      const updatedSessions = sessions.filter(s => s.id !== selectedSession);
      setSessions(updatedSessions);
      if (updatedSessions.length > 0) {
        setSelectedSession(updatedSessions[0].id);
      } else {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error("Archive failed");
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Initializing Pulse...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 glass border-b border-primary/10 mb-2 rounded-t-3xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 glass-panel rounded-2xl flex items-center justify-center text-primary shadow-sm aurora-glow">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-aurora-on-surface">Aura Pulse</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-aurora-on-surface-variant">Neural Network Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNewSession}
            className="btn-aurora-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <SquarePen size={14} />
            New Pulse
          </button>

          <div className="relative">
            <select
              className="glass px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-aurora-on-surface border-transparent focus:border-primary/20 focus:ring-0 outline-none cursor-pointer min-w-[160px]"
              value={selectedSession ?? ""}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="" disabled>Archive</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id} className="bg-white">
                  {session.name ? (session.name.length > 20 ? session.name.substring(0, 20) + '...' : session.name) : 'Untitled Pulse'}
                </option>
              ))}
            </select>
          </div>

          {selectedSession && (
            <button
              onClick={handleDeleteCurrentSession}
              className="p-2.5 rounded-2xl glass hover:bg-error/10 text-aurora-on-surface-variant hover:text-error transition-all"
              title="Archive Pulse"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto px-6 py-4 no-scrollbar">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !loading ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <h2 className="display-lg text-primary mb-2">Hello, {user?.email?.split('@')[0]}</h2>
                <p className="text-lg font-bold text-aurora-on-surface-variant max-w-md mx-auto">
                   Command the neural network. How shall we expand your horizon today?
                </p>
                <div className="grid grid-cols-2 gap-4 mt-12 max-w-2xl w-full">
                  {["Analyze my workflow", "Write a summary", "Generate project ideas", "Technical brainstorm"].map((prompt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setInput(prompt)}
                      className="glass-panel p-4 rounded-3xl text-left hover:bg-white/60 transition-all border border-transparent hover:border-primary/20 group"
                    >
                      <p className="text-xs font-black text-aurora-on-surface mb-1 group-hover:text-primary">{prompt}</p>
                      <p className="text-[10px] font-medium text-aurora-on-surface-variant">Click to initialize command</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id || idx}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      msg.role === "ai" ? "glass-panel text-primary aurora-glow" : "bg-primary text-white"
                    }`}>
                      {msg.role === "ai" ? <Bot size={20} /> : <User size={20} />}
                    </div>

                    <div
                      className={`max-w-[80%] p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-secondary/10 border border-secondary/10 text-aurora-on-surface rounded-tr-sm"
                          : "glass-panel border-primary/5 text-aurora-on-surface rounded-tl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4 justify-start"
                  >
                    <div className="w-10 h-10 glass-panel rounded-2xl flex items-center justify-center flex-shrink-0 text-primary aurora-glow">
                      <Bot size={20} />
                    </div>
                    <div className="glass-panel border-primary/5 rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 glass border-t border-primary/10 rounded-b-3xl mt-2">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Initialize command..."
            disabled={loading}
            className="w-full pl-6 pr-16 py-4 glass-panel border-primary/5 focus:border-primary/20 rounded-2xl text-sm font-bold text-aurora-on-surface placeholder:text-aurora-on-surface-variant focus:outline-none focus:ring-0 disabled:opacity-50 resize-none transition-all"
            rows={1}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary hover:bg-primary/90 disabled:bg-aurora-on-surface-variant/20 text-white rounded-xl transition-all flex items-center justify-center shadow-lg"
          >
            <Send size={18} />
          </motion.button>
        </div>
        <p className="text-[10px] text-center mt-3 font-black uppercase tracking-widest text-aurora-on-surface-variant flex items-center justify-center gap-2">
          <Sparkles size={10} className="text-primary" />
          Powered by Aura Neural Core v3
        </p>
      </div>
    </div>
  );
};

export default Chat;

