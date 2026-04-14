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
import Logo from "../components/structure/Logo";

// Stitch prompt suggestions
const SUGGESTIONS = [
  { icon: "📋", title: "Summarize my meetings", sub: "Generate concise notes from last week." },
  { icon: "🗺️", title: "Plan my next project",  sub: "Create a roadmap for the Q4 rollout." },
  { icon: "✉️", title: "Draft an email",          sub: "Write a follow-up to the design sync." },
  { icon: "💡", title: "Brainstorm ideas",        sub: "List 5 innovative features for the app." },
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
    } catch { toast.error("Failed to fetch sessions"); }
  }, [user, selectedSession]);

  useEffect(() => { fetchSessions(); }, [user, fetchSessions]);

  const fetchMessages = useCallback(async () => {
    if (!selectedSession) { setMessages([]); return; }
    try {
      const list = await getMessages(selectedSession);
      setMessages(list);
    } catch { toast.error("Failed to fetch messages"); }
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
    } catch { toast.error("Failed to send message"); }
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
      toast.success("New session started ✦");
    } catch { toast.error("Initialization failed"); }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Archive this conversation?")) return;
    try {
      await deleteSession(id);
      toast.success("Conversation archived");
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
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-indigo-400 animate-pulse">Initializing Pulse…</p>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] ?? "User";

  return (
    <div className="app-page flex min-h-[calc(100dvh-3.5rem)] flex-col gap-4 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      {/* ── Left Sidebar: Sessions ── */}
      <aside className="flex min-h-0 flex-col gap-3 lg:max-h-[calc(100dvh-8rem)]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewSession}
          className="bg-indigo-600 shadow-lg shadow-indigo-500/20 w-full py-3 px-4 rounded-2xl flex items-center justify-between group transition-all duration-300"
        >
          <span className="font-bold text-white text-xs tracking-wide">New Session</span>
          <Plus size={16} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl border border-white/40 bg-white/30 p-3 shadow-sm shadow-indigo-500/5 backdrop-blur-lg">
          <div className="flex items-center justify-between px-2 mb-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">History</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {sessions.length === 0 && (
              <div className="py-8 text-center px-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No history recorded</p>
              </div>
            )}
            {sessions.map((s) => (
              <motion.div
                key={s.id}
                onClick={() => setSelectedSession(s.id)}
                className={`p-3 rounded-2xl cursor-pointer group flex items-center justify-between gap-3 transition-all duration-300 border ${
                  selectedSession === s.id
                    ? "bg-white shadow-md border-white/50"
                    : "bg-white/10 border-transparent hover:bg-white/30"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${selectedSession === s.id ? "text-indigo-600" : "text-slate-600"}`}>
                    {s.name || "Untitled Session"}
                  </p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5 opacity-70">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <section className="relative flex min-h-[70dvh] min-w-0 flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/20 shadow-inner backdrop-blur-xl lg:max-h-[calc(100dvh-8rem)]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/10 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Logo iconOnly iconClassName="w-5 h-5 filter brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 tracking-tight">Aura Pulse</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Neural Sync Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages / Canvas */}
        <div className="custom-scrollbar relative flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-200/40 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-200/40 blur-[100px] rounded-full" />
          </div>

          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex h-full flex-col items-center justify-center space-y-10 p-4 text-center sm:p-6"
              >
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-white/50">
                    <Logo iconOnly iconClassName="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-800">
                    Synchronize your <span className="text-indigo-600">Intent</span>
                  </h2>
                  <p className="text-sm text-slate-500 font-medium max-w-[320px] mx-auto leading-relaxed opacity-80">
                    Aura Pulse amplifies your cognitive reach through neural-patterned AI orchestration.
                  </p>
                </div>

                <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(s.title)}
                      className="bg-white/40 backdrop-blur-lg border border-white/60 p-6 rounded-[2rem] text-left shadow-lg shadow-indigo-500/5 hover:bg-white/60 hover:border-indigo-300 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-inner flex items-center justify-center text-lg mb-4 group-hover:bg-indigo-50 transition-colors">
                        {s.icon}
                      </div>
                      <p className="text-xs font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{s.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-normal opacity-80">{s.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="relative z-10 mx-auto max-w-3xl space-y-8 pb-6 pt-6">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-md ${
                      msg.role === "ai"
                        ? "bg-gradient-to-tr from-indigo-600 to-pink-500 border-white/20"
                        : "bg-white border-indigo-100 text-indigo-600"
                    }`}>
                      {msg.role === "ai" ? (
                        <Logo iconOnly iconClassName="w-5 h-5 filter brightness-0 invert" />
                      ) : (
                        <span className="text-xs font-black">{displayName[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className={`max-w-[min(100%,42rem)] px-5 py-4 text-sm font-medium leading-relaxed shadow-lg transition-all sm:px-6 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-[2rem] rounded-tr-sm shadow-indigo-500/20"
                        : "bg-white/80 backdrop-blur-lg border border-white/50 text-slate-700 rounded-[2rem] rounded-tl-sm"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-md">
                      <Logo iconOnly iconClassName="w-5 h-5 filter brightness-0 invert" />
                    </div>
                    <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-[2rem] rounded-tl-sm px-6 py-4 flex items-center gap-1.5 shadow-sm">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
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
        <div className="sticky bottom-0 left-0 z-30 w-full border-t border-white/20 bg-white/10 px-4 pb-4 pt-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto max-w-2xl">
            <div className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-2.5 flex items-end gap-3 shadow-2xl shadow-indigo-500/10 transition-all ${
              input.length > 40 ? "rounded-3xl" : ""
            }`}>
              <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-2xl border border-white/40">
                <Paperclip size={18} strokeWidth={2.5} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Aura Pulse..."
                rows={1}
                disabled={loading || !selectedSession}
                className="flex-1 resize-none bg-transparent border-none py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 scrollbar-none"
                style={{ maxHeight: "180px" }}
              />
              <div className="flex items-center gap-2">
                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-2xl border border-white/40">
                  <Mic size={18} strokeWidth={2.5} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim() || !selectedSession}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 disabled:opacity-30 disabled:grayscale disabled:scale-100 transition-all"
                >
                  <Send size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
            <p className="text-center text-[9px] font-black text-slate-400 mt-3 uppercase tracking-[0.25em] opacity-60">
              Neural Network Integrated · Safe Mode Active
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
