// Render the main Notes panel, enabling users to organize note entries with keyword searches, tag categorization, and real-time database listener feeds.

import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Search, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listenToNotes, getNotes, Note } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

// Filter configuration options available for cataloguing note tags.
const FILTERS = ["All", "Personal", "Work", "Ideas"];

// Map tag categories to corresponding styling theme badges.
const TAG_BADGE: Record<string, { bg: string; text: string }> = {
  Ideas:    { bg: "bg-indigo-500/10",  text: "text-indigo-500" },
  Work:     { bg: "bg-pink-500/10",    text: "text-pink-500" },
  Personal: { bg: "bg-purple-500/10",  text: "text-purple-500" },
  General:  { bg: "bg-primary/10",   text: "text-primary" },
};

// Strip HTML tags from a text string to extract pure content for card descriptions.
const stripHtml = (html: string | null) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const Notes = () => {
  // Track lists of user notes, current query strings, and active tag filters.
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { user } = useAuth();

  // Retrieve user-owned notes from storage using the authentication context ID.
  const fetchNotes = useCallback(async () => {
    if (!user) return;
    const fetched = await getNotes(user.id).catch(() => {
      return [] as Note[];
    });
    setNotes(fetched);
  }, [user]);

  // Synchronize notes list and bind a Supabase Postgres changes subscription to live updates.
  useEffect(() => {
    if (!user) return;
    fetchNotes();
    const channel: RealtimeChannel = listenToNotes(user.id, fetchNotes);
    
    // Clean up Supabase listener channels when unmounting or switching users.
    return () => { channel.unsubscribe(); };
  }, [user, fetchNotes]);

  const filtered = notes.filter((n) => {
    const matchSearch =
      (n.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (n.tags || []).some((t: string) => t.toLowerCase() === activeFilter.toLowerCase());
    return matchSearch && matchFilter;
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const cardVariant = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  const getBadge = (tag: string) =>
    TAG_BADGE[tag] ?? TAG_BADGE.General;

  return (
    <div className="app-page">
      {/* ── Hero ── */}
      <motion.section
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          My Notes
        </h1>
        <p className="text-xs sm:text-sm text-text-variant max-w-xl font-medium leading-relaxed">
          A digital space for your thoughts, ideas, and documentation.
        </p>
      </motion.section>

      {/* ── Controls Bar ── */}
      <motion.section
        className="mb-6 sm:mb-8 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl sm:rounded-2xl border border-primary/10 glass p-1 shadow-sm transition-colors duration-500 overflow-x-auto no-scrollbar max-w-full whitespace-nowrap flex-nowrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] uppercase tracking-widest font-black transition-all ${
                activeFilter === f
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.03]"
                  : "text-text-variant hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Right: search + new note */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-full border border-primary/10 glass px-4 py-2 shadow-sm transition-colors duration-500">
            <Search size={14} className="text-primary flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes…"
              className="bg-transparent border-none text-xs text-text outline-none placeholder-text-variant/40 focus:ring-0 sm:w-48 w-full"
            />
          </div>
          <Link to="/notes/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-2.5 text-[10px] sm:text-xs font-black text-white shadow-xl shadow-primary/20 sm:w-auto uppercase tracking-widest"
            >
              <PlusIcon size={14} />
              ADD NOTE
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* ── Notes Grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 text-center glass rounded-2xl sm:rounded-[2rem] border-dashed border-primary/20 p-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary/40 mb-2">
              <FileText size={28} className="sm:w-[32px] sm:h-[32px]" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-text">Notebook Empty</p>
            <p className="text-xs sm:text-sm text-text-variant max-w-xs mx-auto">
              Create your first note to start building your knowledge base.
            </p>
            <Link to="/notes/new" className="mt-2 sm:mt-4">
              <button className="btn-aurora px-8 sm:px-10 py-2.5 sm:py-3 text-xs">
                + Create New Note
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.section
            key="grid"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {filtered.map((note) => {
              const tag = note.tags?.[0] ?? "General";
              const badge = getBadge(tag);
              const dateStr = note.created_at
                ? new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "";

              return (
                <motion.div 
                  key={note.id} 
                  variants={cardVariant} 
                  whileHover={{ y: -8 }}
                  className="glass flex flex-col rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 group transition-all duration-300 border border-primary/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
                >
                  {/* Tag + Date */}
                  <div className="flex justify-between items-start mb-4 sm:mb-5">
                    <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-[0.15em] uppercase ${badge.bg} ${badge.text}`}>
                      {tag}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-variant opacity-60">{dateStr}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/notes/${note.id}`} className="flex-1">
                    <h3 className="text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors cursor-pointer leading-tight">
                      {note.title}
                    </h3>
                    {/* Preview */}
                    <div className="bg-transparent text-text-variant dark:text-slate-300 mb-6 opacity-80">
                      <p className="font-medium leading-relaxed text-sm line-clamp-3 whitespace-pre-wrap">
                        {stripHtml(note.content) || "No content provided..."}
                      </p>
                    </div>
                  </Link>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-5 border-t border-primary/5">
                    <div className="flex gap-1.5">
                      {(note.tags || []).slice(0, 3).map((_: string, i: number) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : "bg-tertiary"
                          }`}
                        />
                      ))}
                    </div>
                    <Link to={`/notes/${note.id}`} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-2.5 transition-all">
                      Open <ChevronRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Note Stats */}
      {filtered.length > 0 && (
        <div className="mt-16 flex justify-center">
          <div className="glass px-8 py-4 rounded-2xl border border-primary/10 flex items-center gap-6 shadow-lg shadow-primary/5">
            <div className="text-center">
              <span className="block text-2xl font-black text-primary">{filtered.length}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-Text--variant/50">Notes</span>
            </div>
            <div className="w-px h-8 bg-primary/20" />
            <div className="text-center">
              <span className="block text-2xl font-black text-primary">
                {notes.reduce((acc, n) => acc + (n.tags?.length || 0), 0)}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-Text-variant/50">Tags</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
