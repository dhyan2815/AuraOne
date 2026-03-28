import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listenToNotes, getNotes, Note } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

const FILTERS = ["All", "Personal", "Work", "Ideas"];

// Map tag → exact Stitch badge class
const TAG_BADGE: Record<string, { bg: string; text: string }> = {
  Ideas:    { bg: "bg-indigo-100",  text: "text-indigo-700" },
  Work:     { bg: "bg-pink-100",    text: "text-pink-700" },
  Personal: { bg: "bg-purple-100",  text: "text-purple-700" },
  General:  { bg: "bg-slate-100",   text: "text-slate-600" },
};

const glassCard =
  "bg-white/40 backdrop-blur-[40px] border border-white/30 rounded-[2rem] p-8 group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-indigo-500/5";

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    const fetched = await getNotes(user.id).catch((e) => {
      console.error("fetch notes:", e);
      return [] as Note[];
    });
    setNotes(fetched);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotes();
    const channel: RealtimeChannel = listenToNotes(user.id, fetchNotes);
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
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const card = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const getBadge = (tag: string) =>
    TAG_BADGE[tag] ?? TAG_BADGE.General;

  return (
    <div className="min-h-screen px-12 pt-10 pb-16">
      {/* ── Hero ── */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Your Archives
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
          Relive your journey. Every thought, sketch, and breakthrough captured in one timeless sanctuary.
        </p>
      </motion.section>

      {/* ── Controls Bar ── */}
      <motion.section
        className="mb-10 flex flex-wrap items-center justify-between gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === f
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Right: search + sort + new note */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm gap-2">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archives..."
              className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder-slate-400 text-slate-700 outline-none"
            />
          </div>
          <Link to="/notes/new">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform text-sm"
            >
              <PlusIcon size={16} />
              New Note
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* ── Notes Grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <p className="text-2xl font-bold text-slate-500">No archives found</p>
            <p className="text-sm text-slate-400 max-w-sm">
              Your first note is waiting to be captured.
            </p>
            <Link to="/notes/new">
              <button className="mt-2 px-8 py-3 rounded-full text-white font-bold shadow-xl bg-gradient-to-r from-indigo-600 to-purple-500">
                + Create First Note
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.section
            key="grid"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((note) => {
              const tag = note.tags?.[0] ?? "General";
              const badge = getBadge(tag);
              const dateStr = note.created_at
                ? new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "";

              return (
                <motion.div key={note.id} variants={card} className={glassCard}>
                  {/* Tag + Date */}
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${badge.bg} ${badge.text}`}>
                      {tag}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{dateStr}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/notes/${note.id}`}>
                    <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-indigo-600 transition-colors cursor-pointer">
                      {note.title}
                    </h3>
                  </Link>

                  {/* Preview */}
                  <p className="text-slate-500 leading-relaxed mb-6 text-sm line-clamp-4">
                    {note.content || "No content yet…"}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex gap-2">
                      {(note.tags || []).slice(0, 3).map((_: string, i: number) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i === 0 ? "bg-indigo-400" : i === 1 ? "bg-purple-400" : "bg-pink-400"
                          }`}
                        />
                      ))}
                    </div>
                    <Link to={`/notes/${note.id}`}>
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold">
                        Open →
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Load More */}
      {filtered.length > 0 && (
        <div className="mt-16 flex justify-center">
          <button className="px-10 py-4 bg-white/40 backdrop-blur-[40px] border border-white/30 rounded-[2rem] font-bold text-indigo-600 hover:bg-white/60 transition-all flex items-center gap-3 shadow-xl shadow-indigo-500/5">
            <span>View Older Archives</span>
            <span className="text-lg">↓</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Notes;