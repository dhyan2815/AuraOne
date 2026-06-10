import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Tag,
  Calendar,
  Save,
  Trash2,
  Cloud,
  RotateCw,
  X,
  History,
} from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "../components/editor/TiptapEditor";
import {
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
  Note,
} from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/structure/Logo";

const NotePage = () => {
  const [note, setNote] = useState<Note | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [content, setContent] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchNote = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (id === "new") {
          setTitle("Untitled Note");
          setContent("");
          setTags([]);
          setNote(null);
        } else if (id) {
          const foundNote = await getNoteById(id);
          if (foundNote) {
            setNote(foundNote);
            setTitle(foundNote.title || "Untitled Note");
            setTags(foundNote.tags || []);
            setContent(foundNote.content || "");
          } else {
            toast.error("Note not found");
            navigate("/notes");
          }
        }
      } catch {
        toast.error("Failed to load note");
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, user, navigate]);

  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!user) return;

    const noteData = {
      title: title.trim() || "Untitled Note",
      tags,
      content,
      is_archived: note?.is_archived || false,
    };

    try {
      setAutoSaving(true);
      if (!note?.id || id === 'new') {
        const newNote = await createNote(user.id, noteData);
        if (!isAutoSave) {
          toast.success("Note Created");
        }
        setLastSaved(new Date());
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else {
        await updateNote(note.id, noteData);
        if (!isAutoSave) {
          toast.success("Note Updated");
        }
        setLastSaved(new Date());
      }
    } catch {
      if (!isAutoSave) {
        toast.error("Failed to save note");
      }
    } finally {
      setAutoSaving(false);
    }
  }, [user, title, tags, content, note, id, navigate]);

  useEffect(() => {
    if (loading || id === 'new') return;
    const autoSaveTimeout = setTimeout(() => {
      handleSave(true);
    }, 5000);
    return () => clearTimeout(autoSaveTimeout);
  }, [content, title, tags, id, loading, handleSave]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleDelete = async () => {
    if (!user || !note?.id) {
      navigate("/notes");
      return;
    }
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      await deleteNote(note.id);
      toast.success("Note Deleted");
      navigate("/notes");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500">
          <RotateCw className="text-primary animate-spin" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Loading Note...</p>
      </div>
    );
  }

  return (
    <div className="app-page-tight space-y-6 sm:space-y-10 px-4 sm:px-0">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="flex items-start gap-4 sm:gap-8 group flex-1">
          <button
            onClick={() => navigate("/notes")}
            className="mt-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass border border-primary/5 text-text-variant hover:text-primary hover:border-primary/20 transition-all active:scale-95 shadow-lg flex-shrink-0"
          >
            <ArrowLeft size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>
          <div className="flex-1 space-y-2 sm:space-y-4 min-w-0">
            <div className="flex items-center gap-1.5 text-primary">
              <Logo iconOnly iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] ml-1">Note Editor</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl sm:text-3xl lg:text-5xl font-extrabold bg-transparent border-0 outline-none w-full text-text placeholder:text-text-variant/10 tracking-tighter leading-none truncate"
              placeholder="Note Title..."
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            {note?.created_at && (
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center text-[9px] sm:text-[10px] font-black text-text-variant uppercase tracking-[0.2em] opacity-60">
                    <Calendar size={10} className="mr-1.5 text-primary sm:w-[12px] sm:h-[12px]" />
                    Created Date: {format(new Date(note.created_at), "MMMM d, yyyy")}
                </div>
                <div className="w-px h-3 bg-primary/20 hidden sm:block" />
                <div className="flex items-center text-[9px] sm:text-[10px] font-black text-text-variant uppercase tracking-[0.2em] opacity-60">
                    <History size={10} className="mr-1.5 text-primary sm:w-[12px] sm:h-[12px]" />
                    Last Edited: {lastSaved ? format(lastSaved, "HH:mm") : "Just now"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:self-end">
          <div className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl glass border border-primary/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 flex-1 sm:flex-initial whitespace-nowrap">
            {autoSaving ? (
              <div className="flex items-center text-primary">
                <RotateCw size={10} className="animate-spin mr-1.5 sm:w-[12px] sm:h-[12px]" />
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center text-emerald-500">
                <Cloud size={12} className="mr-1.5 sm:w-[14px] sm:h-[14px]" />
                <span>Saved</span>
              </div>
            ) : (
              <span className="text-text-variant/40 italic">Ready</span>
            )}
          </div>

          <motion.button onClick={() => handleSave(false)} whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }} className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black text-white shadow-xl shadow-primary/20 sm:w-auto uppercase tracking-widest flex-1 sm:flex-initial whitespace-nowrap">
            <Save size={14} className="sm:w-[18px] sm:h-[18px]" />
            Save Note
          </motion.button>
          <button
            onClick={handleDelete}
            className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl glass border border-primary/5 text-text-variant hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 shadow-lg shadow-red-500/5 flex-shrink-0"
            aria-label="Terminate note"
          >
            <Trash2 size={16} className="sm:w-[20px] sm:h-[20px]" />
          </button>
        </div>
      </div>

      {/* Editor & Sidebar container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        <div className="lg:col-span-12 space-y-4 sm:space-y-6">
            {/* Tag section */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-2 glass rounded-2xl border border-primary/5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 shrink-0">
                    <Tag size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <AnimatePresence mode="popLayout">
                        {tags.map((tag) => (
                            <motion.div
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                key={tag}
                                className="flex items-center gap-2 sm:gap-3 glass border border-primary/10 pl-3 sm:pl-4 pr-2 sm:pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl group/tag"
                            >
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary">{tag}</span>
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="p-1 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-100 sm:opacity-30 sm:group-hover/tag:opacity-100"
                                >
                                    <X size={10} className="sm:w-[12px] sm:h-[12px]" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="relative group/input ml-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addTag()}
                            placeholder="Add Tag..."
                            className="bg-transparent border-0 border-b-2 border-primary/10 outline-none text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] py-1.5 w-24 sm:w-32 focus:w-40 sm:focus:w-48 focus:border-primary transition-all placeholder:text-text-variant/20 text-text"
                        />
                    </div>
                </div>
            </div>

            {/* Editor section */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3.5rem] border border-primary/5 p-4 sm:p-8 lg:p-12 relative overflow-hidden bg-transparent shadow-2xl transition-colors duration-500"
            >
                {/* Background aura effect inside terminal */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="prose max-w-none relative z-10 min-h-[600px] text-text dark:text-slate-100 bg-transparent">
                    <TiptapEditor content={content} onChange={setContent} />
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
