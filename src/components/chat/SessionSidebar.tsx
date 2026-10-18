import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, Check } from "lucide-react";
import { Session } from "../../services/chatSessionService";
import { ConfirmDialog } from "../ui/Dialog";

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
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);

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
      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {showSessionsMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSessionsMobile(false)}
            className="fixed inset-0 z-40 bg-[#141713]/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`sec-aura fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[320px] flex-col gap-4 rounded-r-[28px] bg-sheet p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-sheet lg:shadow-none ${
          showSessionsMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="lm-sheet-title !mb-0">
          Sessions
          <button
            onClick={() => {
              onNewSession();
              setShowSessionsMobile(false);
            }}
            className="lm-round ml-auto !h-9 !w-9 !bg-step"
            aria-label="New session"
          >
            <Plus size={18} strokeWidth={2.6} />
          </button>
          <button
            onClick={() => setShowSessionsMobile(false)}
            className="lm-round !h-9 !w-9 !bg-step lg:hidden"
            aria-label="Close sessions"
          >
            <X size={18} />
          </button>
        </h2>

        <div className="custom-scrollbar grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                if (editingSession?.id !== s.id) {
                  onSelectSession(s.id);
                  setShowSessionsMobile(false);
                }
              }}
              className={`group flex cursor-pointer items-center justify-between gap-3 rounded-[18px] px-3.5 py-3 font-semibold transition-colors ${
                selectedSession === s.id ? "bg-aura text-[#1F211E]" : "hover:bg-water"
              }`}
            >
              {editingSession?.id === s.id ? (
                <div className="flex w-full items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={editingSession.name}
                    onChange={(e) => setEditingSession({ ...editingSession, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(e);
                      if (e.key === "Escape") handleCancelEdit(e);
                    }}
                    aria-label="Session name"
                    className="lm-input !rounded-full !px-3 !py-1.5 !text-sm"
                  />
                  <button onClick={handleSaveEdit} aria-label="Save name" className="flex-none"><Check size={16} /></button>
                  <button onClick={handleCancelEdit} aria-label="Cancel rename" className="flex-none"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <p className="min-w-0 flex-1 truncate">{s.name || "New Chat"}</p>
                  <div className="flex items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                    <button onClick={(e) => handleStartEdit(e, s)} className="p-1" aria-label="Rename session">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPendingDelete(s); }}
                      className="p-1"
                      aria-label="Delete session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Delete this session?"
        body={`${pendingDelete?.name || "This chat"} and its messages will be removed.`}
        cancelLabel="Keep session"
        onConfirm={() => {
          if (pendingDelete) onDeleteSession({ stopPropagation: () => {} } as React.MouseEvent, pendingDelete.id);
        }}
      />
    </>
  );
};

export default SessionSidebar;
