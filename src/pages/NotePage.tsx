// NotesPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Tag,
  Calendar,
  Save,
  Trash2,
  Star,
  Pin,
} from "lucide-react";
import { format } from "date-fns";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
} from "../hooks/useNotes";
import { useAuth } from "../hooks/useAuth";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  pinned: boolean;
  starred: boolean;
}

const NotePage = () => {
  const [note, setNote] = useState<Note | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [starred, setStarred] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      // Update note content state
      if (editor) {
        setNote((prev: Note | null) =>
          prev ? { ...prev, content: editor.getHTML() } : prev
        );
      }
    },
  });

  useEffect(() => {
    // Fetch note on mount
    const fetchNote = async () => {
      if (!editor || !user) {
        setLoading(false);
        return;
      }

      try {
        if (id === "new") {
          // Create new note defaults
          const newNote: Note = {
            id: "new",
            title: "Untitled Note",
            content: "",
            createdAt: new Date().toISOString(),
            tags: [],
            pinned: false,
            starred: false,
          };
          setNote(newNote);
          setTitle(newNote.title); // This will now work
          setTags(newNote.tags);
          setPinned(false);
          setStarred(false);
          editor.commands.setContent("");
        } else if (id) {
          // Fetch existing note
          const foundNote = await getNoteById(user.uid, id);
          if (foundNote) {
            const typedNote = foundNote as Note;
            setNote(typedNote);
            setTitle(typedNote.title);
            setTags(typedNote.tags || []);
            setPinned(typedNote.pinned || false);
            setStarred(typedNote.starred || false);
            editor.commands.setContent(typedNote.content || "");
          } else {
            navigate("/notes");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, editor, user, navigate]);

  useEffect(() => {
    // Sync editor with note content
    if (editor && note?.content !== undefined && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content, false);
    }
  }, [editor, note?.content]);

  // Save or update note
  const handleSave = async () => {
    if (!user || !editor) return;

    const noteData = {
      title: title.trim() || "Untitled Note",
      tags,
      content: editor.getText(),
      pinned,
      starred,
    };

    try {
      if (note?.id === "new" || !note?.id) {
        const newNoteData = {
          ...noteData,
          createdAt: new Date().toISOString(),
        };
        const newId = await createNote(user.uid, newNoteData)
        toast.success("New Note created Successfully");
        navigate(`/notes/${newId}`, { replace: true });
      } else {
        await updateNote(user.uid, note.id, noteData);
        navigate("/notes");
        toast.success("Note Updated sucessfully");
      }
    } catch (err) {
      toast.error("failed to save note");
    }
  };

  // Delete current note
  const handleDelete = async () => {
    if (!user || !note?.id || note.id === "new") {
      navigate("/notes");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this Note?")) return;

    try {
      await deleteNote(user.uid, note.id);
      toast.success("Note deleted successfully");
      navigate("/notes"); // Only after actual deletion
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

  // Toggle starred state
  const toggleStarred = () => {
    setStarred(!starred);
  };

  // Toggle pinned state
  const togglePinned = () => {
    setPinned(!pinned);
  };

  if (loading) {
    // Loading spinner and message
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
    // Page container
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
          {/* Star toggle */}
          <button
            onClick={toggleStarred}
            className={`p-2 rounded-full ${starred
              ? "text-warning-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            aria-label={starred ? "Unstar note" : "Star note"}
          >
            <Star size={20} fill={starred ? "currentColor" : "none"} />
          </button>

          {/* Pin toggle */}
          <button
            onClick={togglePinned}
            className={`p-2 rounded-full ${pinned
              ? "text-primary-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            aria-label={pinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={20} />
          </button>

          {/* Save button */}
          <button onClick={handleSave} className="button-primary">
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
            className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1 "
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
        {/* Write your notes here */}
        <div className="pl-5 text-gray-500 border-0 outline-none text-lg">
          <label htmlFor="Notes">Tap anywhere below to start writing ⬇️</label>
        </div>
      </div>



      {/* Editor section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg dark:shadow-xl shadow-card p-2  min-h-[300px]">
        {editor && (
          // Tiptap content area
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotePage;