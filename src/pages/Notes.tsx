import { useState, useEffect } from "react";
import { PlusIcon, Search, GridIcon, ListIcon } from "lucide-react";
import { Link } from "react-router-dom";
import NoteCard from "../components/notes/NoteCard";
import { motion } from "framer-motion";
import { listenToNotes } from "../hooks/useNotes"; // 🔄 switched from getAllNotes
import { useAuth } from "../hooks/useAuth";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToNotes(user.uid, (fetchedNotes) => {
      setNotes(fetchedNotes as Note[]);
    });

    return () => unsubscribe(); // 🔁 Clean up real-time listener
  }, [user]);

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : notes;

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

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            No notes found
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
          {filteredNotes.map((note) => (
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