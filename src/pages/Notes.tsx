import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Search, GridIcon, ListIcon } from "lucide-react";
import { Link } from "react-router-dom";
import NoteCard from "../components/notes/NoteCard";
import { motion } from "framer-motion";
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
      console.error("Error fetching notes:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchNotes(); // Initial fetch

    const channel: RealtimeChannel = listenToNotes(user.id, (payload) => {
      console.log('Realtime update received for notes:', payload);
      fetchNotes(); // Refetch all notes on any change
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
    const tagMatch = note.tags && note.tags.some((tag) =>
      tag.toLowerCase().includes(searchLower)
    );

    return titleMatch || contentMatch || tagMatch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Notes</h1>

        <div className="flex items-center gap-5">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute flex-1 left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="  Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-1">
            <button
              className={`p-1.5 rounded ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon size={18} />
            </button>
            <button
              className={`p-1.5 rounded ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon size={18} />
            </button>
          </div>

          <Link to="/notes/new" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            New Note
          </Link>
        </div>
      </div>

      {/* Note filter buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* The filter buttons have been removed as the feature is not implemented in Supabase yet */}
      </div>

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            No notes found.
          </p>
          <Link to="/notes/new" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            Create your first note
          </Link>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {sortedNotes.map((note: Note) => (
            <motion.div key={note.id} variants={item}>
              <NoteCard note={note} viewMode={viewMode} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Notes;