// Render the primary AI Chat interface, managing live conversation threads, real-time database updates, session configuration, and deep agent tool insights.

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Paperclip, Database, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getSessions, createNewSession, Session, deleteSession, updateSessionName
} from "../services/chatSessionService";
import SessionSidebar from "../components/chat/SessionSidebar";
import ChatMessage from "../components/chat/ChatMessage";
import {
  getMessages, handleSendMessage, Message,
} from "../services/chatHandler";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import type { AgentEvent, AgentStep } from "../services/agentOrchestrator";
import StepTrace from "../components/chat/StepTrace";

// Prompt suggestions displayed in empty state.
const SUGGESTIONS = [
  { icon: "📋", title: "Summarize", sub: "Analyze recent objectives.", prompt: "Summarize my recent objectives and highlight the key strategic takeaways." },
  { icon: "🗺️", title: "Roadmap",  sub: "Structure Q4 rollout.", prompt: "Create a detailed, structured roadmap for our Q4 product rollout." },
  { icon: "✉️", title: "Draft",    sub: "Write follow-up sync.", prompt: "Draft a professional follow-up communication for our recent synchronization meeting." },
  { icon: "💡", title: "Ideas",    sub: "List 5 neural features.", prompt: "List 5 innovative neural features and capabilities we could implement in the platform." },
];

const Chat = () => {
  // Access global authenticated user information and page loading state.
  const { user, loading: authLoading } = useAuth();
  
  // Manage conversation logs, dynamic user input state, and active process loaders.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBrainMode, setIsBrainMode] = useState(false);
  const [liveSteps, setLiveSteps] = useState<AgentStep[]>([]);
  const [draft, setDraft] = useState("");
  
  // Track lists of historical chat sessions.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
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

  // Fold streamed agent events into the live trace and the answer draft.
  const onAgentEvent = useCallback((e: AgentEvent) => {
    if (e.type === "token") setDraft((d) => d + e.text);
    else if (e.type === "reset_draft") setDraft("");
    else setLiveSteps((s) => [...s, e]);
  }, []);

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
    setLiveSteps([]);
    setDraft("");
    setLoading(true);
    
    try {
      await handleSendMessage(msg, user, selectedSession, currentBrainMode, onAgentEvent);
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

  const handleRenameSession = async (id: string, newName: string) => {
    try {
      await updateSessionName(id, newName);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
      toast.success("Session renamed");
    } catch {
      toast.error("Failed to rename session");
    }
  };

  if (authLoading) {
    return (
      <div className="sec-aura grid min-h-[60vh] place-items-center" role="status">
        <div className="text-center">
          <div className="lm-blob lm-pulse mx-auto mb-4 h-20 w-20" />
          <p className="lm-display text-3xl">Connecting to Aura…</p>
        </div>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] ?? "User";

  return (
    <div className="sec-aura">
      <section className="lm-lobe">
        <h1>Aura</h1>
        <p>Plain words in, real changes out. Command mode acts on your data; Brain mode reasons it through first.</p>
        <div className="lm-acts">
          <div className="lm-seg" role="group" aria-label="Mode">
            <button onClick={() => setIsBrainMode(false)} aria-pressed={!isBrainMode}>Command</button>
            <button onClick={() => setIsBrainMode(true)} aria-pressed={isBrainMode}>Brain</button>
          </div>
          <button
            onClick={() => setShowSessionsMobile(true)}
            className="lm-btn lm-btn-ghost lg:hidden"
          >
            <Menu size={16} /> Sessions
          </button>
        </div>
      </section>

      <div className="lm-lift grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SessionSidebar
          sessions={sessions}
          selectedSession={selectedSession}
          onSelectSession={setSelectedSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          showSessionsMobile={showSessionsMobile}
          setShowSessionsMobile={setShowSessionsMobile}
        />

        {/* ── Main Chat ── */}
        <section className="lm-sheet flex min-h-[560px] flex-col gap-4">
          <div
            ref={scrollContainerRef}
            className="custom-scrollbar flex max-h-[58vh] min-h-[320px] flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden overscroll-contain"
          >
            {messages.length === 0 && !loading ? (
              <div className="my-auto py-10">
                <p className="lm-display text-5xl">How can I assist?</p>
                <p className="mt-2 text-ink2">Try one of these, or type your own.</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <ChatMessage key={msg.id || idx} msg={msg} displayName={displayName} onResolved={fetchMessages} />
                ))}

                {loading && (
                  <div className="flex max-w-[680px] flex-col gap-2 self-start" role="status">
                    <StepTrace steps={liveSteps} live />
                    <div className="rounded-[26px] bg-water px-5 py-3.5 text-[17px] text-ink">
                      {draft || <span className="text-ink2">Aura is thinking…</span>}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.prompt, true)}
                  title={s.sub}
                  className="rounded-full bg-water px-3.5 py-2 text-sm font-semibold transition-transform active:scale-[.96]"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Pill composer */}
          <div className="flex items-end gap-2 rounded-[28px] bg-water p-1.5">
            <button className="lm-round !h-10 !w-10 !bg-step self-center" aria-label="Attach file">
              <Paperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aura to add, move or find…"
              aria-label="Message Aura"
              rows={1}
              className="custom-scrollbar max-h-[200px] min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-3 text-[17px] text-ink outline-none placeholder:text-ink2"
            />
            <button
              onClick={() => setIsBrainMode(!isBrainMode)}
              aria-pressed={isBrainMode}
              aria-label="Brain mode"
              title="Brain mode"
              className={`lm-round !h-10 !w-10 self-center ${isBrainMode ? "!bg-aura !text-[#1F211E]" : "!bg-step"}`}
            >
              <Database size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="lm-btn self-center"
            >
              <Send size={16} strokeWidth={2.6} /> Send
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Chat;
