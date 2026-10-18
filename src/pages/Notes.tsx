// Render the main Notes panel, enabling users to organize note entries with keyword searches, tag categorization, and real-time database listener feeds.

import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Search, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listenToNotes, getNotes, Note } from "../hooks/useNotes";
import Count from "../components/ui/Count";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

const FILTERS = ["All", "Personal", "Work", "Ideas"];

const stripHtml = (html: string | null) => {
  if (!html) return '';
  // Agent-written notes are raw markdown: drop the syntax so the card shows plain text.
  if (!/^\s*</.test(html)) {
    return html
      .replace(/^\s*(-{3,}|\*{3,})\s*$/gm, ' ')
      .replace(/^\s*(#{1,6}|[-*+]|\d+\.|>)\s+/gm, '')
      .replace(/(\*+|~~|`)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
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

  // Cards reveal as they scroll into view; delay staggers across each row.
  const cardVariant = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="sec-notes">
      <section className="lm-lobe">
        <h1>Notes</h1>
        <p><Count n={notes.length} /> {notes.length === 1 ? "note" : "notes"} · every one searchable by Aura.</p>
        <div className="lm-acts">
          <Link to="/notes/new" className="lm-btn">
            <PlusIcon size={16} strokeWidth={3} /> New note
          </Link>
        </div>
      </section>

      <div className="lm-lift">
        {/* Search + tag filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex min-w-[260px] flex-1 items-center gap-2.5 rounded-full bg-sheet px-5 py-3 sm:flex-none sm:basis-[320px]">
            <Search size={16} className="flex-shrink-0 text-ink2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes"
              aria-label="Search notes"
              className="w-full border-0 bg-transparent text-ink outline-none placeholder:text-ink2"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                aria-pressed={activeFilter === f}
                className={`rounded-full px-3.5 py-[7px] text-sm font-semibold transition-colors ${
                  activeFilter === f ? "bg-notes text-[#1F211E]" : "bg-sheet"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notes grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={<FileText size={28} />}
                title={notes.length === 0 ? "Notebook empty" : "No matches"}
                description={
                  notes.length === 0
                    ? "Create your first note to start building your knowledge base."
                    : "Nothing matches that search or tag. Try another."
                }
                actionLink="/notes/new"
                actionLabel="+ Create new note"
              />
            </div>
          ) : (
            <motion.section
              key="grid"
              className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 md:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
              {filtered.map((note, i) => {
                const dateStr = note.created_at
                  ? new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "";

                return (
                  <motion.div
                    key={note.id}
                    layout
                    variants={cardVariant}
                    initial="hidden"
                    whileInView="show"
                    exit={{ opacity: 0, scale: 0.96 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ delay: (i % 3) * 0.05 }}
                  >
                    <Link
                      to={`/notes/${note.id}`}
                      className="lm-card-hover flex min-h-[220px] flex-col gap-2.5 rounded-sheet bg-sheet p-[22px_24px]"
                    >
                      <motion.h3 layoutId={`note-title-${note.id}`} className="text-[26px] font-extrabold leading-none" style={{ letterSpacing: "-.04em", fontStretch: "78%" }}>
                        {note.title || "Untitled note"}
                      </motion.h3>
                      <p className="line-clamp-3 whitespace-pre-wrap text-base text-ink2">
                        {stripHtml(note.content) || "No content provided…"}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                        {(note.tags || []).slice(0, 3).map((tag: string) => (
                          <span key={tag} className="lm-chip">#{tag}</span>
                        ))}
                        <span className="lm-muted ml-auto">{dateStr}</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notes;
