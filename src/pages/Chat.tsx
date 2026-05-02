import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Trash2, Plus, Paperclip, Mic } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getSessions, createNewSession, deleteSession, Session,
} from "../services/chatSessionService";
import {
  getMessages, handleSendMessage, Message,
} from "../services/chatHandler";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Logo from "../components/structure/Logo";

const SUGGESTIONS = [
  { icon: "📋", title: "Summarize", sub: "Analyze recent objectives." },
  { icon: "🗺️", title: "Roadmap",  sub: "Structure Q4 rollout." },
  { icon: "✉️", title: "Draft",    sub: "Write follow-up sync." },
  { icon: "💡", title: "Ideas",    sub: "List 5 neural features." },
];

const HANDSHAKE_STEPS = [
  "Processing request context...",
  "Querying workspace modules...",
  "Drafting strategic response...",
];

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBrainMode, setIsBrainMode] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let interval: any;
    if (loading) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % 3);
      }, 1500);
    } else {
      setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getSessions(user.id);
      setSessions(list);
      if (list.length > 0 && !selectedSession) setSelectedSession(list[0].id);
    } catch { toast.error("Historical sync failed"); }
  }, [user, selectedSession]);

  useEffect(() => { fetchSessions(); }, [user, fetchSessions]);

  const fetchMessages = useCallback(async () => {
    if (!selectedSession) {
      console.log('[Chat] No session selected, clearing messages.');
      setMessages([]);
      return;
    }
    try {
      console.log('[Chat] Fetching historical messages for session:', selectedSession);
      const list = await getMessages(selectedSession);
      console.log(`[Chat] Received ${list.length} messages.`);
      setMessages(list);
    } catch (err) {
      console.error('[Chat] Matrix error: Messages', err);
      toast.error("Matrix error: Messages");
    }
  }, [selectedSession]);

  useEffect(() => {
    if (!selectedSession) return;
    
    fetchMessages();
    
    console.log(`[Chat] Initializing Real-time Matrix Sync for session: ${selectedSession}`);
    const channel = supabase
      .channel(`chat-messages-${selectedSession}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "chat_messages", 
          filter: `session_id=eq.${selectedSession}` 
        },
        (payload) => {
          console.log('[Chat] Real-time message detected:', payload.new.id);
          setMessages((cur) => {
            // PREVENT DUPLICATES: Only add if message ID doesn't exist
            const exists = cur.some(m => m.id === payload.new.id);
            if (exists) return cur;

            // If it's a real user message arriving, remove the corresponding optimistic one
            if (payload.new.role === 'user') {
              console.log('[Chat] Real user message confirmed, cleaning up optimistic state.');
              return [...cur.filter(m => !m.id?.toString().startsWith('temp-')), payload.new as Message];
            }

            return [...cur, payload.new as Message];
          });
        }
      )
      .subscribe((status) => {
        console.log(`[Chat] Real-time Sync Status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error('[Chat] Real-time subscription failed. Manual sync will handle fallback.');
        }
      });

    return () => {
      console.log(`[Chat] Disconnecting Real-time Sync for session: ${selectedSession}`);
      supabase.removeChannel(channel);
    };
  }, [selectedSession, fetchMessages]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!user || !selectedSession || !input.trim()) return;
    const msg = input;
    
    // Optimistic UI Update: Add user message to state immediately
    const tempUserMsg: Message = {
      role: 'user',
      content: msg,
      session_id: selectedSession,
      user_id: user.id,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    
    setInput("");
    setLoading(true);
    console.log('[Chat] handleSend: Initiating transmission...');
    
    try {
      await handleSendMessage(msg, user, selectedSession, isBrainMode);
      console.log('[Chat] handleSend: Transmission successful, refreshing data...');
      
      // Secondary Sync: Refresh messages and sessions manually to ensure UI is current
      const [updatedSessions, updatedMessages] = await Promise.all([
        getSessions(user.id),
        getMessages(selectedSession)
      ]);
      
      setSessions(updatedSessions);
      setMessages(updatedMessages);
      console.log('[Chat] handleSend: Data sync complete.');
      
    } catch (err) {
      console.error('[Chat] Transmission failed:', err);
      toast.error("Transmission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleNewSession = async () => {
    if (!user) return;
    try {
      const s = await createNewSession(user);
      setSessions([s, ...sessions]);
      setSelectedSession(s.id);
      setMessages([]);
      setInput("");
      toast.success("New Session Initialized ✦");
    } catch { toast.error("Initialization failed"); }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Archive this conversation?")) return;
    try {
      await deleteSession(id);
      toast.success("Archive Successful");
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      if (selectedSession === id) {
        setSelectedSession(updated[0]?.id ?? null);
        setMessages([]);
      }
    } catch { toast.error("Archive failed"); }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Connecting to Aura AI Assistant...</p>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] ?? "User";

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col gap-4 lg:grid lg:grid-cols-[18rem_1fr] lg:px-6 lg:pt-16">
      {/* ── Left Sidebar: Sessions ── */}
      <aside className="flex min-h-0 flex-col gap-3 lg:h-full lg:max-h-[calc(100dvh-4rem)]">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleNewSession}
          className="bg-primary shadow-lg shadow-primary/10 w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300"
        >
          <Plus size={16} className="text-white" strokeWidth={2.5} />
          <span className="font-bold text-white text-xs tracking-wide">New Chat</span>
        </motion.button>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/10 glass shadow-sm transition-colors duration-500">
          <div className="px-4 py-3 border-b border-primary/5 bg-primary/5">
            <h3 className="text-[11px] font-bold text-text-variant uppercase tracking-wider opacity-70">Recent Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {sessions.length === 0 && (
              <div className="py-12 text-center px-4">
                <p className="text-[11px] text-text-variant/40 font-bold uppercase tracking-wider leading-relaxed">No history found</p>
              </div>
            )}
            <div className="space-y-1">
              {sessions.map((s) => (
                <motion.div
                  key={s.id}
                  onClick={() => setSelectedSession(s.id)}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer group flex items-center justify-between gap-3 transition-all duration-200 border ${
                    selectedSession === s.id
                      ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                      : "bg-transparent border-transparent hover:bg-primary/5 text-text-variant hover:text-text"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {s.name || "New Chat"}
                    </p>
                    <p className="text-[10px] font-medium opacity-50 mt-0.5">
                      {s.created_at ? format(new Date(s.created_at), "MMM dd") : ""}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="p-1 text-text-variant/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <section className="relative flex min-h-[calc(100dvh-8rem)] min-w-0 flex-col overflow-hidden rounded-2xl border border-primary/10 glass shadow-sm transition-colors duration-500">
        {/* Chat Header */}
        <div className="px-6 h-14 border-b border-primary/5 flex items-center justify-between bg-primary/5 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/10">
              <Logo iconOnly iconClassName="w-[1.125rem] h-[1.125rem] filter brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text tracking-wide uppercase">Aura Assistant</h2>
            </div>
          </div>
        </div>

        {/* Messages / Canvas */}
        <div className="custom-scrollbar relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex h-full flex-col items-center justify-center space-y-8 p-4 text-center pb-20"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 glass shadow-sm flex items-center justify-center mx-auto mb-6 border border-primary/10">
                    <Logo iconOnly iconClassName="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Welcome to <span className="text-primary">Aura Assistant</span>
                  </h2>
                  <p className="text-xs text-text-variant font-medium max-w-[280px] mx-auto leading-relaxed opacity-60">
                    How can I help you optimize your neural workflow today?
                  </p>
                </div>

                <div className="grid w-full max-w-lg grid-cols-2 gap-3">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setInput(s.title)}
                      className="glass border border-primary/5 p-4 rounded-xl text-left hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base mb-3 group-hover:scale-110 transition-transform">
                        {s.icon}
                      </div>
                      <p className="text-[10px] font-bold text-text uppercase tracking-wider group-hover:text-primary transition-colors">{s.title}</p>
                      <p className="text-[10px] text-text-variant font-medium mt-1 leading-normal opacity-60">{s.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="relative z-10 mx-auto max-w-3xl space-y-10 pb-6">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                      msg.role === "ai"
                        ? "bg-gradient-to-tr from-primary to-secondary border border-white/20"
                        : "glass border border-primary/20 text-primary"
                    }`}>
                      {msg.role === "ai" ? (
                        <Logo iconOnly iconClassName="w-4 h-4 filter brightness-0 invert" />
                      ) : (
                        <span className="text-[11px] font-bold uppercase">{displayName[0]}</span>
                      )}
                    </div>
                    <div className={`max-w-[80%] px-4 py-2.5 text-sm font-medium leading-relaxed transition-all ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary/10"
                        : "glass border border-primary/5 text-text rounded-2xl rounded-tl-sm shadow-sm"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-sm">
                      <Logo iconOnly iconClassName="w-4 h-4 filter brightness-0 invert" />
                    </div>
                    <div className="glass border border-primary/5 rounded-2xl rounded-tl-sm px-5 py-3 flex flex-col gap-2 shadow-sm min-w-[200px]">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <motion.p
                        key={thinkingStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono"
                      >
                        {HANDSHAKE_STEPS[thinkingStep]}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Input Area */}
        <div className="sticky bottom-0 left-0 z-30 w-full border-t border-primary/5 glass-panel px-4 pb-4 pt-4">
          <div className="mx-auto max-w-3xl">
            <div className={`glass border border-primary/15 rounded-xl p-1.5 flex items-end gap-1.5 shadow-xl shadow-primary/5 transition-all`}>
              <button className="p-2.5 text-text-variant hover:text-primary transition-all rounded-lg hover:bg-primary/5">
                <Paperclip size={18} strokeWidth={2} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Aura Assistant..."
                rows={1}
                disabled={loading || !selectedSession}
                className="flex-1 resize-none bg-transparent border-none py-2.5 text-sm font-medium text-text outline-none placeholder:text-text-variant/40 focus:ring-0 scrollbar-none"
                style={{ maxHeight: "150px" }}
              />
              <div className="flex items-center gap-1.5">
                {/* BRAIN Toggle */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg glass border border-primary/10 transition-all mr-1">
                  <span className="text-[9px] font-black tracking-[0.1em] text-text-variant uppercase">Brain</span>
                  <button
                    onClick={() => setIsBrainMode(!isBrainMode)}
                    className={`relative w-7 h-3.5 rounded-full transition-all duration-300 ${isBrainMode ? 'bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]' : 'bg-text-variant/20'}`}
                  >
                    <motion.div
                      animate={{ x: isBrainMode ? 14 : 2 }}
                      className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <button className="p-2.5 text-text-variant hover:text-primary transition-all rounded-lg hover:bg-primary/5">
                  <Mic size={18} strokeWidth={2} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim() || !selectedSession}
                  className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  <Send size={16} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3 opacity-30">
              <p className="text-[10px] font-bold text-text-variant uppercase tracking-widest text-center">Workspace Secured</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
