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
  RotateCw
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
import { motion } from "framer-motion";
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
          setTitle("Draft Protocol");
          setContent("");
          setTags([]);
          setNote(null);
        } else if (id) {
          const foundNote = await getNoteById(id);
          if (foundNote) {
            setNote(foundNote);
            setTitle(foundNote.title || "Draft Protocol");
            setTags(foundNote.tags || []);
            setContent(foundNote.content || "");
          } else {
            toast.error("Protocol not found");
            navigate("/notes");
          }
        }
      } catch (error) {
        toast.error("Neural link sync failed");
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
      title: title.trim() || "Draft Protocol",
      tags,
      content,
      is_archived: note?.is_archived || false,
    };

    try {
      setAutoSaving(true);
      if (!note?.id || id === 'new') {
        const newNote = await createNote(user.id, noteData);
        if (!isAutoSave) {
          toast.success("Memory archive established");
        }
        setLastSaved(new Date());
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else {
        await updateNote(note.id, noteData);
        if (!isAutoSave) {
          toast.success("Archive updated");
        }
        setLastSaved(new Date());
      }
    } catch (err) {
      if (!isAutoSave) {
        toast.error("Memory sync failed");
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
    if (!window.confirm("Purge this memory from archive?")) return;
    try {
      await deleteNote(note.id);
      toast.success("Protocol neutralized");
      navigate("/notes");
    } catch (error) {
      toast.error("Archive integrity maintained");
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
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4">
          <RotateCw className="text-primary animate-spin" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Recalibrating Archive...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-6 group">
          <button
            onClick={() => navigate("/notes")}
            className="mt-1 p-3 rounded-2xl glass border border-primary/5 text-aurora-on-surface-variant hover:text-primary hover:border-primary/20 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-primary">
              <Logo iconOnly iconClassName="w-3.5 h-3.5 drop-shadow-sm" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Editing Protocol</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl md:text-5xl font-black bg-transparent border-0 outline-none w-full text-aurora-on-surface placeholder:text-aurora-on-surface-variant/20 tracking-tight leading-none"
              placeholder="Draft Protocol"
            />
            {note?.created_at && (
              <div className="flex items-center text-[10px] font-bold text-aurora-on-surface-variant uppercase tracking-widest opacity-60">
                <Calendar size={12} className="mr-2" />
                Captured on {format(new Date(note.created_at), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:self-end">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl glass border border-primary/5 text-[10px] font-black uppercase tracking-wider">
            {autoSaving ? (
              <div className="flex items-center text-primary group">
                <RotateCw size={12} className="animate-spin mr-2" />
                <span>Synchronizing...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center text-success/60">
                <Cloud size={14} className="mr-2" />
                <span>Last Sync: {format(lastSaved, "HH:mm")}</span>
              </div>
            ) : (
              <span className="text-aurora-on-surface-variant/40 italic">System Ready</span>
            )}
          </div>

          <button onClick={() => handleSave(false)} className="btn-aurora-primary px-8 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2">
            <Save size={16} />
            Commit Changes
          </button>

          <button
            onClick={handleDelete}
            className="p-3 rounded-2xl glass border border-primary/5 text-aurora-on-surface-variant hover:text-error hover:border-error/20 transition-all active:scale-95"
            aria-label="Delete protocol"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Tag section */}
      <div className="flex flex-wrap items-center gap-3 p-1">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary/40">
          <Tag size={18} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={tag}
              className="flex items-center gap-2 glass border border-primary/10 pl-3 pr-2 py-1.5 rounded-xl group/tag"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-md flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors opacity-40 group-hover/tag:opacity-100"
              >
                &times;
              </button>
            </motion.div>
          ))}

          <div className="relative group/input ml-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Add Tag..."
              className="bg-transparent border-0 border-b border-primary/10 outline-none text-[10px] font-black uppercase tracking-wider py-1.5 w-24 focus:w-40 focus:border-primary transition-all placeholder:text-aurora-on-surface-variant/20"
            />
          </div>
        </div>
      </div>

      {/* Editor section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel rounded-[3rem] p-8 min-h-[500px] border border-primary/5 shadow-2xl shadow-primary/5"
      >
        <div className="prose prose-aurora max-w-none">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </motion.div>
    </div>
  );
};

export default NotePage;