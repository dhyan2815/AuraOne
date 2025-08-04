import { useState, useEffect } from "react";
import { PlusIcon, Search, GridIcon, ListIcon, Star, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import NoteCard from "../components/notes/NoteCard";
import { motion } from "framer-motion";
import { listenToNotes } from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  starred?: boolean;
  pinned?: boolean;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "starred" | "pinned">("all");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToNotes(user.uid, (fetchedNotes) => {
      setNotes(fetchedNotes as Note[]);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredNotes = notes.filter((note) => {
    // First apply status filter
    let statusFiltered = true;
    if (filter === "starred") statusFiltered = note.starred === true;
    if (filter === "pinned") statusFiltered = note.pinned === true;
    
    // Then apply search filter
    let searchFiltered = true;
    if (searchQuery) {
      searchFiltered = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return statusFiltered && searchFiltered;
  });

  // Sort notes: pinned first, then starred, then by creation date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then starred notes
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    
    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${filter === "all"
              ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${filter === "starred"
              ? "bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          onClick={() => setFilter("starred")}
        >
          <Star size={16} />
          Starred
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${filter === "pinned"
              ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          onClick={() => setFilter("pinned")}
        >
          <Pin size={16} />
          Pinned
        </button>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {filter === "all"
              ? "No notes found"
              : filter === "starred"
                ? "No starred notes yet"
                : "No pinned notes yet"}
          </p>
          {filter !== "all" && (
            <button
              className="text-primary-600 hover:text-primary-700"
              onClick={() => setFilter("all")}
            >
              View all notes
            </button>
          )}
          {filter === "all" && (
            <Link to="/notes/new" className="button-primary">
              <PlusIcon size={18} className="mr-1" />
              Create your first note
            </Link>
          )}
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