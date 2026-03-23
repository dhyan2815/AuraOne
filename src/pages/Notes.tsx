import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Search, GridIcon, ListIcon, Sparkles, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
import NoteCard from "../components/notes/NoteCard";
import { motion, AnimatePresence } from "framer-motion";
import { listenToNotes, getNotes, Note } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedNotes = await getNotes(user.id);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Link severed:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotes();
    const channel: RealtimeChannel = listenToNotes(user.id, () => {
      fetchNotes();
    });
    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchNotes]);

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = note.title && note.title.toLowerCase().includes(searchLower);
    const contentMatch = note.content && note.content.toLowerCase().includes(searchLower);
    const tagMatch = note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchLower));
    return titleMatch || contentMatch || tagMatch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} className="aurora-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Knowledge Base</span>
          </div>
          <h1 className="display-lg leading-tight text-aurora-on-surface">Digital Archive</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input
              type="text"
              placeholder="Search archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-aurora pl-12 w-full py-3"
            />
          </div>

          <div className="flex items-center glass p-1 rounded-2xl border border-primary/5 shadow-sm">
            <button
              className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-aurora-on-surface-variant hover:text-primary"}`}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon size={18} />
            </button>
            <button
              className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-aurora-on-surface-variant hover:text-primary"}`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon size={18} />
            </button>
          </div>

          <Link to="/notes/new" className="btn-aurora-primary px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]">
            <PlusIcon size={16} />
            Capture Note
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sortedNotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-[3rem] border-dashed border-primary/10"
          >
            <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mb-6 shadow-sm text-primary/30">
              <StickyNote size={40} />
            </div>
            <h3 className="text-xl font-black text-aurora-on-surface mb-2 italic tracking-tight">Archive Empty</h3>
            <p className="text-xs font-bold text-aurora-on-surface-variant max-w-xs mb-8 uppercase tracking-widest leading-relaxed">
              Synchronize your thoughts and expand the collective intelligence.
            </p>
            <Link to="/notes/new" className="btn-aurora-secondary px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em]">
              Initialize Capture
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layout
            className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4 max-w-5xl mx-auto"}
          >
            {sortedNotes.map((note: Note, idx) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                layout
              >
                <NoteCard note={note} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;