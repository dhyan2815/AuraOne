import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Trash2, Plus, Paperclip, Mic, Sparkles, X } from "lucide-react";
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

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    if (!selectedSession) { setMessages([]); return; }
    try {
      const list = await getMessages(selectedSession);
      setMessages(list);
    } catch { toast.error("Matrix error: Messages"); }
  }, [selectedSession]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`chat-messages-${selectedSession}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${selectedSession}` },
        (payload) => setMessages((cur) => [...cur, payload.new as Message])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedSession, fetchMessages]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!user || !selectedSession || !input.trim()) return;
    const msg = input;
    setInput("");
    setLoading(true);
    try {
      await handleSendMessage(msg, user, selectedSession);
      setSessions(await getSessions(user.id));
    } catch { toast.error("Transmission failed"); }
    finally { setLoading(false); }
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
    <div className="app-page flex min-h-[calc(100dvh-3.5rem)] flex-col gap-4 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]">
      {/* ── Left Sidebar: Sessions ── */}
      <aside className="flex min-h-0 flex-col gap-4 lg:max-h-[calc(100dvh-8rem)]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewSession}
          className="bg-primary shadow-xl shadow-primary/20 w-full py-4 px-6 rounded-2xl flex items-center justify-between group transition-all duration-300"
        >
          <span className="font-black text-white text-xs uppercase tracking-widest">NEW CHAT</span>
          <Plus size={18} className="text-white" strokeWidth={3} />
        </motion.button>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-[2rem] border border-primary/10 glass p-3 shadow-2xl shadow-primary/5 transition-colors duration-500">
          <div className="flex items-center justify-between px-3 mt-2">
            <h3 className="text-[10px] font-black text-text-variant uppercase tracking-[0.25em] opacity-60">Chat History</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {sessions.length === 0 && (
              <div className="py-12 text-center px-4">
                <p className="text-[10px] text-text-variant/40 font-black uppercase tracking-[0.2em] leading-relaxed">No chats found.<br/>Start a new conversation.</p>
              </div>
            )}
            {sessions.map((s) => (
              <motion.div
                key={s.id}
                onClick={() => setSelectedSession(s.id)}
                className={`p-4 rounded-2xl cursor-pointer group flex items-center justify-between gap-4 transition-all duration-300 border ${
                  selectedSession === s.id
                    ? "bg-primary/10 border-primary/20 shadow-lg shadow-primary/5"
                    : "bg-transparent border-transparent hover:bg-primary/5 hover:translate-x-1"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${selectedSession === s.id ? "text-primary" : "text-text"}`}>
                    {s.name || "New Chat"}
                  </p>
                  <p className="text-[9px] font-black text-text-variant/50 uppercase tracking-widest mt-1">
                    {s.created_at ? format(new Date(s.created_at), "MMM dd") : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="p-1.5 text-text-variant/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <section className="relative flex min-h-[70dvh] min-w-0 flex-1 flex-col overflow-hidden rounded-[3rem] border border-primary/10 glass shadow-2xl shadow-primary/5 transition-colors duration-500 lg:max-h-[calc(100dvh-8rem)]">
        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-primary/5 flex items-center justify-between bg-primary/5 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Logo iconOnly iconClassName="w-6 h-6 filter brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text tracking-tight uppercase tracking-[0.1em]">Aura Assistant</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-80">Connected & Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages / Canvas */}
        <div className="custom-scrollbar relative flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex h-full flex-col items-center justify-center space-y-12 p-4 text-center"
              >
                <div className="space-y-4">
                  <div className="w-24 h-24 rounded-[3rem] bg-primary/5 glass shadow-2xl flex items-center justify-center mx-auto mb-10 border border-primary/10">
                    <Logo iconOnly iconClassName="w-14 h-14" />
                  </div>
                  <h2 className="text-4xl font-extrabold tracking-tighter text-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Ask Aura <span className="text-primary italic">Anything</span>
                  </h2>
                  <p className="text-sm text-text-variant font-medium max-w-[340px] mx-auto leading-relaxed opacity-60">
                    Ask me anything to help organize your day, manage your tasks, or brainstorm new ideas.
                  </p>
                </div>

                <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(s.title)}
                      className="glass border border-primary/5 p-6 rounded-[2.5rem] text-left hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                        {s.icon}
                      </div>
                      <p className="text-[10px] font-black text-text uppercase tracking-widest group-hover:text-primary transition-colors">{s.title}</p>
                      <p className="text-[10px] text-text-variant font-medium mt-1.5 leading-normal opacity-60">{s.sub}</p>
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
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      msg.role === "ai"
                        ? "bg-gradient-to-tr from-primary to-secondary border border-white/20"
                        : "glass border border-primary/20 text-primary"
                    }`}>
                      {msg.role === "ai" ? (
                        <Logo iconOnly iconClassName="w-6 h-6 filter brightness-0 invert" />
                      ) : (
                        <span className="text-xs font-black uppercase tracking-widest">{displayName[0]}</span>
                      )}
                    </div>
                    <div className={`max-w-[85%] px-6 py-4.5 text-sm font-medium leading-relaxed shadow-2xl transition-all ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-[2.5rem] rounded-tr-sm shadow-primary/20"
                        : "glass border border-primary/5 text-text rounded-[2.5rem] rounded-tl-sm"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg">
                      <Logo iconOnly iconClassName="w-6 h-6 filter brightness-0 invert" />
                    </div>
                    <div className="glass border border-primary/5 rounded-[2.5rem] rounded-tl-sm px-8 py-5 flex items-center gap-2 shadow-sm">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce shadow-glow shadow-primary/50" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Input Area */}
        <div className="sticky bottom-0 left-0 z-30 w-full border-t border-primary/5 glass-panel px-6 pb-6 pt-4">
          <div className="mx-auto max-w-3xl">
            <div className={`glass border border-primary/10 rounded-[2.5rem] p-3 flex items-end gap-3 shadow-2xl shadow-primary/10 transition-all ${
              input.length > 40 ? "rounded-3xl" : ""
            }`}>
              <button className="p-3.5 text-text-variant hover:text-primary transition-all rounded-2xl hover:bg-primary/5">
                <Paperclip size={20} strokeWidth={2} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                disabled={loading || !selectedSession}
                className="flex-1 resize-none bg-transparent border-none py-3.5 text-sm font-bold text-text outline-none placeholder:text-text-variant/30 focus:ring-0 scrollbar-none"
                style={{ maxHeight: "150px" }}
              />
              <div className="flex items-center gap-2">
                <button className="p-3.5 text-text-variant hover:text-primary transition-all rounded-2xl hover:bg-primary/5">
                  <Mic size={20} strokeWidth={2} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim() || !selectedSession}
                  className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  <Send size={20} strokeWidth={3} />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
              <Sparkles size={10} className="text-primary" />
              <p className="text-[9px] font-black text-text-variant uppercase tracking-[0.4em]">Secured with AuraOne AI</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
