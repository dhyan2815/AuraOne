// Render the primary AI Chat interface, managing live conversation threads, real-time database updates, session configuration, and deep agent tool insights.

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Plus, Paperclip, ExternalLink, Database, Search, Wrench, ChevronDown, ChevronUp, Trash2, Pencil, Check, X, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getSessions, createNewSession, Session, deleteSession, updateSessionName
} from "../services/chatSessionService";
import {
  getMessages, handleSendMessage, Message,
} from "../services/chatHandler";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/structure/Logo";

// Prompt suggestions displayed in empty state.
const SUGGESTIONS = [
  { icon: "📋", title: "Summarize", sub: "Analyze recent objectives.", prompt: "Summarize my recent objectives and highlight the key strategic takeaways." },
  { icon: "🗺️", title: "Roadmap",  sub: "Structure Q4 rollout.", prompt: "Create a detailed, structured roadmap for our Q4 product rollout." },
  { icon: "✉️", title: "Draft",    sub: "Write follow-up sync.", prompt: "Draft a professional follow-up communication for our recent synchronization meeting." },
  { icon: "💡", title: "Ideas",    sub: "List 5 neural features.", prompt: "List 5 innovative neural features and capabilities we could implement in the platform." },
];

// Steps for loading sequence animations.
const HANDSHAKE_STEPS = [
  "Analyzing context...",
  "Searching knowledge base...",
  "Thinking through plan...",
  "Applying tool calls...",
  "Synthesizing response...",
];

const Chat = () => {
  // Access global authenticated user information and page loading state.
  const { user, loading: authLoading } = useAuth();
  
  // Manage conversation logs, dynamic user input state, and active process loaders.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBrainMode, setIsBrainMode] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  
  // Track lists of historical chat sessions and metadata expansion states.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [expandedMetadata, setExpandedMetadata] = useState<Record<string, boolean>>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionName, setEditSessionName] = useState("");
  const [showSessionsMobile, setShowSessionsMobile] = useState(false);
  
  // Store DOM references to auto-scroll message logs and auto-resize text inputs.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea elements to accommodate larger multi-line prompt messages dynamically.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  // Smoothly scroll the message container down to show the latest response block.
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 50);
  };

  // Cycle through handshake loader steps periodically while waiting for the AI backend.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % HANDSHAKE_STEPS.length);
      }, 1500);
    } else {
      setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Retrieve user-owned chat sessions from database storage.
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getSessions(user.id);
      setSessions(list);
      if (list.length > 0 && !selectedSession) setSelectedSession(list[0].id);
    } catch { toast.error("Historical sync failed"); }
  }, [user, selectedSession]);

  // Synchronize chat histories when the authenticated user context is updated.
  useEffect(() => { fetchSessions(); }, [user, fetchSessions]);

  // Load message logs for the active selected chat session.
  const fetchMessages = useCallback(async () => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }
    try {
      const list = await getMessages(selectedSession);
      setMessages(list);
    } catch {
      toast.error("Matrix error: Messages");
    }
  }, [selectedSession]);

  // Initialize a real-time Postgres subscription to append new messages automatically.
  useEffect(() => {
    if (!selectedSession) return;
    
    fetchMessages();
    
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
          setMessages((cur) => {
            const exists = cur.some(m => m.id === payload.new.id);
            if (exists) return cur;

            if (payload.new.role === 'user') {
              return [...cur.filter(m => !m.id?.startsWith('temp-')), payload.new as Message];
            }

            return [...cur, payload.new as Message];
          });
        }
      )
      .subscribe();

    // Tear down Postgres channel listener on component unmount or session swap.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession, fetchMessages]);

  // Trigger auto-scroll on change in the messages log array.
  useEffect(scrollToBottom, [messages]);

  // Dispatch a new user message, trigger loading state, and invoke agent orchestrator handler.
  const handleSend = async (messageOverride?: string | unknown, forceBrainMode?: boolean) => {
    const textToProcess = typeof messageOverride === 'string' ? messageOverride : input;
    if (!user || !selectedSession || !textToProcess.trim()) return;
    const msg = textToProcess;
    
    if (forceBrainMode) {
      setIsBrainMode(true);
    }
    const currentBrainMode = forceBrainMode || isBrainMode;

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
    
    try {
      await handleSendMessage(msg, user, selectedSession, currentBrainMode);
      const [updatedSessions, updatedMessages] = await Promise.all([
        getSessions(user.id),
        getMessages(selectedSession)
      ]);
      setSessions(updatedSessions);
      setMessages(updatedMessages);
    } catch {
      toast.error("Transmission failed");
    } finally {
      setLoading(false);
    }
  };

  // Capture Enter press inside textareas to submit requests without using Shift+Enter.
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

  const toggleMetadata = (id: string) => {
    setExpandedMetadata(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (selectedSession === id) {
        const nextSession = sessions.find(s => s.id !== id)?.id || null;
        setSelectedSession(nextSession);
      }
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    }
  };

  const handleStartEdit = (e: React.MouseEvent, s: Session) => {
    e.stopPropagation();
    setEditingSessionId(s.id);
    setEditSessionName(s.name || "New Chat");
  };

  const handleSaveEdit = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!editingSessionId || !editSessionName.trim()) return;
    try {
      await updateSessionName(editingSessionId, editSessionName);
      setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, name: editSessionName } : s));
      setEditingSessionId(null);
      toast.success("Session renamed");
    } catch {
      toast.error("Failed to rename session");
    }
  };

  const handleCancelEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
    setEditSessionName("");
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Connecting to Aura AI...</p>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] ?? "User";

  return (
    <div className="fixed inset-0 bottom-[55px] z-10 flex flex-col gap-4 overflow-hidden md:relative md:inset-auto md:bottom-auto md:z-0 md:h-[100dvh] lg:grid lg:grid-cols-[18rem_1fr] lg:p-6">
      {/* Mobile Sidebar backdrop */}
      <AnimatePresence>
        {showSessionsMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSessionsMobile(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside 
        className={`flex min-h-0 shrink-0 flex-col gap-4 z-50 fixed inset-y-0 left-0 w-[85vw] max-w-[320px] p-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-primary/10 shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:flex lg:w-full lg:translate-x-0 lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none ${
          showSessionsMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:hidden mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Chat History</span>
          <button 
            onClick={() => setShowSessionsMobile(false)} 
            className="p-2 rounded-xl hover:bg-primary/10 text-text-variant active:scale-95 transition-colors bg-primary/5"
          >
            <X size={18} />
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            handleNewSession();
            setShowSessionsMobile(false);
          }}
          className="bg-primary shadow-lg shadow-primary/10 w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 flex-shrink-0"
        >
          <Plus size={16} className="text-white" strokeWidth={2.5} />
          <span className="font-bold text-white text-xs tracking-wide">New Chat</span>
        </motion.button>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/10 glass shadow-sm">
          <div className="px-4 py-3 border-b border-primary/5 bg-primary/5">
            <h3 className="text-[11px] font-bold text-text-variant uppercase tracking-wider opacity-70">History</h3>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3">
            <div className="space-y-1.5">
              {sessions.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    if (editingSessionId !== s.id) {
                      setSelectedSession(s.id);
                      setShowSessionsMobile(false);
                    }
                  }}
                  className={`px-3 py-3 rounded-xl cursor-pointer group flex items-center justify-between gap-3 transition-all ${
                    selectedSession === s.id 
                      ? "bg-primary/10 border border-primary/20 text-primary" 
                      : "hover:bg-primary/5 text-text-variant border border-transparent"
                  }`}
                >
                  {editingSessionId === s.id ? (
                    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editSessionName}
                        onChange={(e) => setEditSessionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(e);
                          if (e.key === 'Escape') handleCancelEdit(e);
                        }}
                        className="bg-transparent border-b border-primary text-xs font-bold outline-none flex-1 w-full text-text"
                      />
                      <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-600 transition-colors">
                        <Check size={14} />
                      </button>
                      <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-600 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold truncate flex-1">{s.name || "New Chat"}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleStartEdit(e, s)} className="p-1 hover:text-primary transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={(e) => handleDeleteSession(e, s.id)} className="p-1 hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat ── */}
      <section className="relative flex flex-1 flex-col h-full min-h-0 overflow-hidden rounded-3xl border border-primary/10 bg-white dark:bg-slate-900 shadow-2xl shadow-primary/5 isolation-auto">
        <div className="px-4 sm:px-6 h-14 sm:h-16 border-b border-primary/5 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setShowSessionsMobile(true)}
              className="lg:hidden p-2.5 rounded-xl border border-primary/10 text-text-variant hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center active:scale-95 bg-white/50 dark:bg-slate-800/50 shadow-sm"
              title="Menu"
            >
              <Menu size={18} />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Logo iconOnly iconClassName="w-4.5 h-4.5 sm:w-5 sm:h-5 filter brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-sm sm:text-md font-black text-text tracking-widest leading-none">Aura Assistant</h2>
            </div>
          </div>
        </div>

        <div ref={scrollContainerRef} className="custom-scrollbar relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-32 overscroll-contain touch-pan-y">
          <AnimatePresence>
            {messages.length === 0 && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                <div className="w-16 h-16 rounded-2xl glass mb-6 border border-primary/10 flex items-center justify-center">
                  <Logo iconOnly iconClassName="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-text">How can I assist?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(s.prompt, true)}
                      className="glass border border-primary/10 p-5 rounded-2xl text-left hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">{s.title}</p>
                      </div>
                      <p className="text-[11px] font-medium text-text-variant leading-relaxed opacity-80">{s.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-8">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "ai" ? "bg-gradient-to-tr from-primary to-secondary text-white" : "glass border border-primary/20 text-primary"
                    }`}>
                      {msg.role === "ai" ? <Logo iconOnly iconClassName="w-4 h-4 filter brightness-0 invert" /> : <span className="text-[11px] font-bold">{displayName[0]}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-2 max-w-[85%]">
                      <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-white dark:bg-primary text-black dark:text-white border border-primary/10 rounded-2xl rounded-tr-sm shadow-md" 
                          : "bg-white dark:bg-slate-800 border border-primary/5 text-black dark:text-white rounded-2xl rounded-tl-sm"
                      }`}>
                        <div className="whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Metadata / Sources UI */}
                      {msg.role === "ai" && msg.metadata && (
                        <div className="mt-1">
                          <button 
                            onClick={() => toggleMetadata(msg.id || idx.toString())}
                            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all mb-2"
                          >
                            {msg.metadata.sources?.length ? <Search size={10} /> : <Wrench size={10} />}
                            {msg.metadata.sources?.length ? `${msg.metadata.sources.length} Context Sources` : 'Agent Insights'}
                            {expandedMetadata[msg.id || idx.toString()] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          
                          <AnimatePresence>
                            {expandedMetadata[msg.id || idx.toString()] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                              >
                                {msg.metadata.toolsUsed && msg.metadata.toolsUsed.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {msg.metadata.toolsUsed.map((tool: string, ti: number) => (
                                      <div key={ti} className="px-2 py-1 rounded bg-primary/5 border border-primary/10 flex items-center gap-1.5">
                                        <Wrench size={10} className="text-primary" />
                                        <span className="text-[9px] font-bold text-text-variant opacity-70">{tool}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {msg.metadata.sources && msg.metadata.sources.map((source: { id: string; sourceType: string; title: string; content: string; similarity: number }, si: number) => (
                                  <div key={si} className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3 group">
                                    <Database size={14} className="text-primary/40 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold text-text-variant uppercase mb-1">
                                        {source.sourceType} • {(source.similarity * 100).toFixed(0)}% Match
                                      </p>
                                      <p className="text-xs text-text opacity-70 line-clamp-2 italic">"{source.content}"</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-all p-1 text-text-variant hover:text-primary">
                                      <ExternalLink size={12} />
                                    </button>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                      <Logo iconOnly iconClassName="w-4 h-4 filter brightness-0 invert" />
                    </div>
                    <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-primary/10 rounded-2xl rounded-tl-sm px-6 py-4 flex flex-col min-w-[240px] shadow-lg shadow-primary/5">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]" />
                        <span className="ml-2 text-[10px] font-bold text-primary uppercase tracking-[0.1em] font-mono">
                          {HANDSHAKE_STEPS[thinkingStep]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-4 w-full" />
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full bg-white/5 dark:bg-white/5 backdrop-blur-md p-4 pb-20 md:p-6 lg:pb-8 shrink-0 border-t border-primary/5">
          <div className="mx-auto max-w-4xl">
            <div className="bg-white dark:bg-slate-800 backdrop-blur-2xl border border-primary/20 rounded-2xl p-2 flex items-end gap-2 shadow-2xl shadow-primary/10 transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5">
              <div className="flex items-center self-center pl-1">
                <button className="p-2 text-text-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                  <Paperclip size={20} />
                </button>
              </div>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Aura..."
                rows={1}
                className="flex-1 bg-transparent border-none py-3 text-sm font-semibold text-text outline-none resize-none min-h-[44px] max-h-[200px] custom-scrollbar"
              />
              
              <div className="flex items-center gap-2 pr-1 shrink-0 self-center md:self-end md:pb-1">
                <button 
                  onClick={() => setIsBrainMode(!isBrainMode)} 
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    isBrainMode 
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-inner shadow-primary/5' 
                      : 'bg-text-variant/5 border-transparent text-text-variant hover:bg-text-variant/10'
                  }`}
                >
                  <Database size={14} className={isBrainMode ? 'animate-pulse' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Brain Mode</span>
                  <div className={`relative w-6 h-3 rounded-full transition-all ${isBrainMode ? 'bg-primary/40' : 'bg-text-variant/20'}`}>
                    <motion.div animate={{ x: isBrainMode ? 14 : 2 }} className="absolute top-0.5 w-2 h-2 rounded-full bg-white shadow-sm" />
                  </div>
                </button>

                <button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()} 
                  className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-20 disabled:grayscale transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95 shrink-0"
                >
                  <Send size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
            <p className="text-[9px] text-center mt-3 text-text-variant uppercase font-black tracking-[0.2em] opacity-40">
              Aura Assistant          </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
