import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Tag,
  Calendar,
  Save,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "../components/editor/TiptapEditor";
import {
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
  Note, // Import the centralized Note interface
} from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";

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
          setNote(null); // No existing note
        } else if (id) {
          const foundNote = await getNoteById(id);
          if (foundNote) {
            setNote(foundNote);
            setTitle(foundNote.title || "Untitled Note");
            setTags(foundNote.tags || []);
            setContent(foundNote.content || "");
          } else {
            toast.error("Note not found.");
            navigate("/notes");
          }
        }
      } catch (error) {
        toast.error("Failed to fetch note.");
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, user, navigate]);

  // Save or update note, wrapped in useCallback for performance
  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!user) return;

    const noteData = {
      title: title.trim() || "Untitled Note",
      tags,
      content,
      is_archived: note?.is_archived || false, // Preserve existing archive status
    };

    try {
      setAutoSaving(true);
      if (!note?.id || id === 'new') { // If it's a new note
        const newNote = await createNote(user.id, noteData);
        if (!isAutoSave) {
          toast.success("New Note created Successfully");
        }
        setLastSaved(new Date());
        // Navigate to the new note's URL to enable editing/auto-saving
        navigate(`/notes/${newNote.id}`, { replace: true });
      } else { // If it's an existing note
        await updateNote(note.id, noteData);
        if (!isAutoSave) {
          toast.success("Note Updated successfully");
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

  // Auto-save effect
  useEffect(() => {
    if (loading || id === 'new') return; // Don't auto-save on initial load or for new notes

    const autoSaveTimeout = setTimeout(() => {
      handleSave(true);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [content, title, tags, id, loading, handleSave]);

  // Keyboard shortcuts
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

  // Delete current note
  const handleDelete = async () => {
    if (!user || !note?.id) { // Cannot delete a note that hasn't been saved
      navigate("/notes");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this Note?")) return;

    try {
      await deleteNote(note.id);
      toast.success("Note deleted successfully");
      navigate("/notes");
    } catch (error) {
      toast.error("Deletion of note failed");
    }
  };

  // Add new tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading note...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Title and date */}
        <div className="flex items-center">
          {/* Back button */}
          <button
            onClick={() => navigate("/notes")}
            className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            {/* Note title input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold bg-transparent border-0 outline-none w-full"
              placeholder="Note title"
            />
            {/* Creation date display */}
            {note?.createdAt && (
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                <Calendar size={14} className="mr-1" />
                {format(new Date(note.createdAt), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Status indicator */}
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            {autoSaving && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary-500 mr-2"></div>
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !autoSaving && (
              <span>Last saved: {format(lastSaved, "HH:mm")}</span>
            )}
          </div>

          {/* Save button */}
          <button onClick={() => handleSave(false)} className="button-primary">
            <Save size={18} className="mr-1" />
            Save
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-slate-400 hover:text-error-600 dark:hover:text-error-400"
            aria-label="Delete note"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Tag input section */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tag size={16} className="text-slate-500 dark:text-slate-400" />

        {/* Existing tags */}
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1"
          >
            <span className="text-base">{tag}</span>
            {/* Remove tag button */}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              &times;
            </button>
          </div>
        ))}

        {/* New tag input */}
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add tag..."
            className="bg-transparent border-0 outline-none text-base"
          />
          {/* Add tag button */}
          <button
            onClick={addTag}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-base font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Editor section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg dark:shadow-xl shadow-card overflow-hidden p-4">
        <div className="prose dark:prose-invert max-w-none">
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
};

export default NotePage;