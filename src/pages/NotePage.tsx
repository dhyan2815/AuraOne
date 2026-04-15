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
      } catch (error) {
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
    } catch (err) {
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
    } catch (error) {
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
    <div className="app-page-tight space-y-10">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="flex items-start gap-8 group flex-1">
          <button
            onClick={() => navigate("/notes")}
            className="mt-1 p-4 rounded-2xl glass border border-primary/5 text-text-variant hover:text-primary hover:border-primary/20 transition-all active:scale-95 shadow-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Logo iconOnly iconClassName="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Note Editor</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl lg:text-5xl font-extrabold bg-transparent border-0 outline-none w-full text-text placeholder:text-text-variant/10 tracking-tighter leading-none"
              placeholder="Note Title..."
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            {note?.created_at && (
              <div className="flex items-center gap-4">
                <div className="flex items-center text-[10px] font-black text-text-variant uppercase tracking-[0.2em] opacity-60">
                    <Calendar size={12} className="mr-2 text-primary" />
                    Created Date: {format(new Date(note.created_at), "MMMM d, yyyy")}
                </div>
                <div className="w-px h-3 bg-primary/20" />
                <div className="flex items-center text-[10px] font-black text-text-variant uppercase tracking-[0.2em] opacity-60">
                    <History size={12} className="mr-2 text-primary" />
                    Last Edited: {lastSaved ? format(lastSaved, "HH:mm") : "Just now"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:self-end">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-primary/10 text-[10px] font-black uppercase tracking-widest transition-colors duration-500">
            {autoSaving ? (
              <div className="flex items-center text-primary">
                <RotateCw size={12} className="animate-spin mr-2" />
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center text-emerald-500">
                <Cloud size={14} className="mr-2" />
                <span>Saved</span>
              </div>
            ) : (
              <span className="text-text-variant/40 italic">Ready</span>
            )}
          </div>

          <button onClick={() => handleSave(false)} className="flex items-center gap-3 px-6 py-3.5 rounded-2xl glass border border-primary/10 text-primary hover:text-primary hover:border-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10">
            <Save size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Save Note</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-3.5 rounded-2xl glass border border-primary/5 text-text-variant hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 shadow-lg shadow-red-500/5"
            aria-label="Terminate note"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Editor & Sidebar container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 space-y-6">
            {/* Tag section */}
            <div className="flex flex-wrap items-center gap-4 p-2 glass rounded-2xl border border-primary/5">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 shrink-0">
                    <Tag size={18} strokeWidth={2.5} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <AnimatePresence mode="popLayout">
                        {tags.map((tag) => (
                            <motion.div
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                key={tag}
                                className="flex items-center gap-3 glass border border-primary/10 pl-4 pr-3 py-2 rounded-xl group/tag"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{tag}</span>
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="p-1 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-30 group-hover/tag:opacity-100"
                                >
                                    <X size={12} />
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
                            className="bg-transparent border-0 border-b-2 border-primary/10 outline-none text-[10px] font-black uppercase tracking-[0.2em] py-2 w-32 focus:w-48 focus:border-primary transition-all placeholder:text-text-variant/20 text-text"
                        />
                    </div>
                </div>
            </div>

            {/* Editor section */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass rounded-[3.5rem] border border-primary/5 p-6 shadow-2xl transition-colors duration-500 sm:p-8 lg:p-12 relative overflow-hidden"
            >
                {/* Background aura effect inside terminal */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="prose prose-aurora max-w-none relative z-10 min-h-[600px]">
                    <TiptapEditor content={content} onChange={setContent} />
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
