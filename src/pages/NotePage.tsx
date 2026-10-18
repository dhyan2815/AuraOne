// Render the individual NotePage editor, featuring rich Tiptap editor blocks, custom category tag listings, automatic save triggers, and manual Ctrl+S hotkeys.

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Trash2,
  RotateCw,
  X,
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
import { ConfirmDialog } from "../components/ui/Dialog";

const NotePage = () => {
  // Track loaded note configuration, title headings, categorizing tags, and auto-save timers.
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { user } = useAuth();

  // Load the note content by URL ID parameter or initialize new note properties.
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
          return setNote(null);
        }

        if (!id) return;

        const foundNote = await getNoteById(id);
        if (!foundNote) {
          toast.error("Note not found");
          return navigate("/notes");
        }

        setNote(foundNote);
        setTitle(foundNote.title || "Untitled Note");
        setTags(foundNote.tags || []);
        setContent(foundNote.content || "");
      } catch {
        toast.error("Failed to load note");
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, user, navigate]);

  // Save modified note fields to the database table, handling insertions or updates.
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
        if (!isAutoSave) toast.success("Note Created");
        setLastSaved(new Date());
        return navigate(`/notes/${newNote.id}`, { replace: true });
      }

      await updateNote(note.id, noteData);
      if (!isAutoSave) toast.success("Note Updated");
      setLastSaved(new Date());
    } catch {
      if (!isAutoSave) {
        toast.error("Failed to save note");
      }
    } finally {
      setAutoSaving(false);
    }
  }, [user, title, tags, content, note, id, navigate]);

  // Set up an auto-save timer to capture editor changes automatically after 5 idle seconds.
  useEffect(() => {
    if (loading || id === 'new') return;
    const autoSaveTimeout = setTimeout(() => {
      handleSave(true);
    }, 5000);
    return () => clearTimeout(autoSaveTimeout);
  }, [content, title, tags, id, loading, handleSave]);

  // Register window event listeners for Cmd+S or Ctrl+S manual save keyboard shortcuts.
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
    try {
      await deleteNote(note.id);
      toast.success("Note Deleted");
      navigate("/notes");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags([...tags, trimmed]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="sec-notes grid min-h-[60vh] place-items-center" role="status">
        <div className="text-center">
          <div className="lm-blob lm-pulse mx-auto mb-4 h-20 w-20" />
          <p className="lm-display text-3xl">Loading note…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sec-notes">
      {/* Coloured head: back link, save status, title, tags */}
      <div
        className="-mx-4 bg-sec px-5 pb-14 pt-5 text-[#1F211E] md:-mx-6 md:px-8"
        style={{ borderRadius: "0 0 54% 0 / 0 0 46% 0" }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => navigate("/notes")} className="inline-flex items-center gap-1.5 font-semibold">
            <ArrowLeft size={16} /> All notes
          </button>
          <span className="ml-auto flex items-center gap-2 text-sm font-semibold" role="status">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={autoSaving ? "saving" : lastSaved ? "saved" : "ready"}
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {autoSaving ? (
                  <>
                    <RotateCw size={12} className="animate-spin" /> Saving…
                  </>
                ) : lastSaved ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
                    </svg>
                    Saved · {format(lastSaved, "HH:mm")}
                  </>
                ) : (
                  <span className="opacity-70">Ready</span>
                )}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <motion.input
          layoutId={id && id !== "new" ? `note-title-${id}` : undefined}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Note title"
          placeholder="Note title…"
          className="lm-display mt-4 w-full border-0 bg-transparent text-[clamp(44px,6vw,92px)] outline-none placeholder:opacity-40"
        />

        <div className="lm-acts !mt-2.5">
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={tag}
                className="lm-chip inline-flex items-center gap-1.5 !bg-white/60 !text-[#1F211E]"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="+ Tag"
            aria-label="Add tag"
            className="w-24 rounded-full bg-[#1F211E] px-3 py-[3px] text-[13px] font-bold text-white outline-none placeholder:text-white/70 focus:w-36"
          />
        </div>
      </div>

      <div className="relative -mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="lm-sheet">
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div className="grid content-start gap-5">
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">Note</h2>
            <p className="lm-muted">
              {note?.created_at ? `Created ${format(new Date(note.created_at), "MMM d, yyyy")}` : "Not saved yet"}
              {lastSaved ? ` · edited ${format(lastSaved, "HH:mm")}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => handleSave(false)} className="lm-btn">
                <Save size={16} /> Save note
              </button>
              <button
                onClick={() => (note?.id ? setConfirmDelete(true) : handleDelete())}
                className="lm-btn lm-btn-danger"
              >
                <Trash2 size={16} /> Delete note
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this note?"
        body={`${title || "This note"} and its knowledge chunks will be removed. Aura won't be able to cite it.`}
        cancelLabel="Keep note"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default NotePage;
