import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, Check } from "lucide-react";
import { Session } from "../../services/chatSessionService";

interface SessionSidebarProps {
  sessions: Session[];
  selectedSession: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onRenameSession: (id: string, newName: string) => Promise<void>;
  showSessionsMobile: boolean;
  setShowSessionsMobile: (val: boolean) => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  selectedSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  showSessionsMobile,
  setShowSessionsMobile,
}) => {
  const [editingSession, setEditingSession] = useState<{ id: string; name: string } | null>(null);

  const handleStartEdit = (e: React.MouseEvent, s: Session) => {
    e.stopPropagation();
    setEditingSession({ id: s.id, name: s.name || "New Chat" });
  };

  const handleSaveEdit = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!editingSession || !editingSession.name.trim()) return;
    await onRenameSession(editingSession.id, editingSession.name);
    setEditingSession(null);
  };

  const handleCancelEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingSession(null);
  };

  return (
    <>
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
            onNewSession();
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
                    if (editingSession?.id !== s.id) {
                      onSelectSession(s.id);
                      setShowSessionsMobile(false);
                    }
                  }}
                  className={`px-3 py-3 rounded-xl cursor-pointer group flex items-center justify-between gap-3 transition-all ${
                    selectedSession === s.id
                      ? "bg-primary/10 border border-primary/20 text-primary"
                      : "hover:bg-primary/5 text-text-variant border border-transparent"
                  }`}
                >
                  {editingSession?.id === s.id ? (
                    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editingSession.name}
                        onChange={(e) => setEditingSession({ ...editingSession, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(e);
                          if (e.key === "Escape") handleCancelEdit(e);
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
                        <button onClick={(e) => onDeleteSession(e, s.id)} className="p-1 hover:text-red-500 transition-colors">
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
    </>
  );
};

export default SessionSidebar;
