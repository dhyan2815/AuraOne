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
    <div className="flex overflow-hidden p-6 gap-6" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── Left Sidebar: Sessions ── */}
      <aside className="w-80 flex flex-col gap-4 flex-shrink-0">
        {/* New Chat button */}
        <button
          onClick={handleNewSession}
          className="bg-white/25 backdrop-blur-[40px] border border-white/30 w-full py-4 px-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/40 transition-all duration-300"
        >
          <span className="font-bold text-slate-700">New Chat</span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={16} />
          </div>
        </button>

        {/* Sessions list */}
        <div className="flex-1 bg-white/25 backdrop-blur-[40px] border border-white/30 rounded-[2rem] p-4 flex flex-col gap-3 overflow-hidden">
          <h3 className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Recent Sessions
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(129,140,248,0.2) transparent" }}>
            {sessions.length === 0 && (
              <p className="text-xs text-slate-400 px-4 py-2">No sessions yet. Start a new chat!</p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSession(s.id)}
                className={`p-4 rounded-[1.5rem] cursor-pointer group flex items-start justify-between gap-2 transition-all ${
                  selectedSession === s.id
                    ? "bg-white/60 shadow-sm border border-white/50"
                    : "bg-white/20 hover:bg-white/40"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate mb-1 ${selectedSession === s.id ? "text-slate-700" : "text-slate-600"}`}>
                    {s.name || "Untitled Session"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <section className="flex-1 flex flex-col bg-white/25 backdrop-blur-[40px] border border-white/30 rounded-[2rem] overflow-hidden relative">

        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-white/30 flex items-center justify-between bg-white/10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200 text-xl">
              ✦
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Aura Pulse</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(129,140,248,0.2) transparent" }}>
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-12"
              >
                <div className="space-y-4">
                  <h2 className="text-5xl font-extrabold tracking-tight text-slate-800">
                    Hello, {displayName}
                  </h2>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">
                    How can Aura Pulse help you illuminate your workflow today?
                  </p>
                </div>

                {/* Suggestion cards */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s.title)}
                      className="bg-white/25 backdrop-blur-[40px] border border-white/30 p-6 rounded-[2rem] text-left hover:bg-white/40 transition-all group"
                    >
                      <span className="text-2xl mb-3 block">{s.icon}</span>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto pb-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-sm font-bold ${
                      msg.role === "ai"
                        ? "bg-gradient-to-tr from-indigo-600 to-pink-400 text-white"
                        : "bg-indigo-600 text-white"
                    }`}>
                      {msg.role === "ai" ? "✦" : displayName[0].toUpperCase()}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[70%] p-5 text-sm font-medium leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-indigo-50/80 border border-indigo-100 text-slate-700 rounded-[2rem] rounded-tr-md"
                        : "bg-white/80 backdrop-blur-[40px] border border-white/50 text-slate-700 rounded-[2rem] rounded-tl-md"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-400 flex items-center justify-center text-white flex-shrink-0 text-sm">✦</div>
                    <div className="bg-white/80 border border-white/50 rounded-[2rem] rounded-tl-md px-6 py-4 flex items-center gap-1.5">
                      {[0.1, 0.2, 0.3].map((d, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div
            className="bg-white/25 backdrop-blur-[40px] border border-white/30 max-w-4xl mx-auto rounded-[2.5rem] p-2 flex items-center gap-4 shadow-2xl shadow-indigo-500/10"
          >
            <button className="p-3 text-slate-400 hover:text-indigo-500 transition-colors ml-2">
              <Paperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or ask a question..."
              rows={1}
              disabled={loading || !selectedSession}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-slate-700 placeholder:text-slate-400 resize-none outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-2 mr-2">
              <button className="p-3 text-slate-400 hover:text-indigo-500 transition-colors">
                <Mic size={18} />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={loading || !input.trim() || !selectedSession}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-400 text-white flex items-center justify-center shadow-lg shadow-indigo-300/50 hover:scale-105 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
            Aura Pulse can make mistakes. Verify important info.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Chat;
