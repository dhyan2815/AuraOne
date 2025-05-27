import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  deleteNote as deleteNoteFromDb,
  getNoteById,
} from "../../dist/hooks/useNotes";

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
  const [note, setNote] = useState<Note | any>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [starred, setStarred] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      // Update note content when editor changes
      setNote((prev: any) => (prev ? { ...prev, content: editor.getHTML() } : prev));
    },
  });

  // Fetch note data
  useEffect(() => {
    if (!editor) return;
    const fetchNote = async () => {
      setLoading(true);

      if (id === "new") {
        const newNote = {
          id: "new",
          title: "Untitled Note",
          content: "",
          createdAt: new Date().toISOString(),
          tags: [],
          pinned: false,
          starred: false,
        };
        setNote(newNote);
        setTitle(newNote.title);
        setTags(newNote.tags);
        setPinned(false);
        setStarred(false);
        editor?.commands.setContent("");
      } else {
        const foundNote = await getNoteById(id);
        if (foundNote) {
          setNote(foundNote);
          setTitle(foundNote.title);
          setTags(foundNote.tags);
          setPinned(foundNote.pinned);
          setStarred(foundNote.starred);
        } else {
          navigate("/notes");
        }
      }

      setLoading(false);
    };

    fetchNote();
  }, [id, editor, navigate]);

  //to sync editor content once it's ready
  useEffect(() => {
    if (editor && note?.content !== undefined) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note?.content]);

  const handleSave = async () => {
    const newData = {
      title,
      tags,
      content: editor?.getHTML() || "",
      createdAt: note.createdAt || new Date().toISOString(),
      pinned,
      starred,
    };

    try {
      if (note.id === "new") {
        await createNote(newData);
      } else {
        await updateNote(note.id, newData);
      }
      navigate("/notes");
    } catch (errr) {
      console.error("failed to save note: ", errr);
    }
  };

  const handleDelete = async () => {
    if (note.id !== "new") {
      await deleteNoteFromDb(note.id);
    }
    navigate("/notes");
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

  const toggleStarred = () => {
    setStarred(!starred);
  };

  const togglePinned = () => {
    setPinned(!pinned);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/notes")}
            className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold bg-transparent border-0 outline-none w-full"
              placeholder="Note title"
            />
            {note?.createdAt && (
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                <Calendar size={14} className="mr-1" />
                {format(new Date(note.createdAt), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleStarred}
            className={`p-2 rounded-full ${
              starred
                ? "text-warning-500"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            aria-label={starred ? "Unstar note" : "Star note"}
          >
            <Star size={20} fill={starred ? "currentColor" : "none"} />
          </button>

          <button
            onClick={togglePinned}
            className={`p-2 rounded-full ${
              pinned
                ? "text-primary-500"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            aria-label={pinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={20} />
          </button>

          <button onClick={handleSave} className="button-primary">
            <Save size={18} className="mr-1" />
            Save
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-slate-400 hover:text-error-600 dark:hover:text-error-400"
            aria-label="Delete note"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Tag size={16} className="text-slate-500 dark:text-slate-400" />

        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1"
          >
            <span className="text-sm">{tag}</span>
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              &times;
            </button>
          </div>
        ))}

        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add tag..."
            className="bg-transparent border-0 outline-none text-sm"
          />
          <button
            onClick={addTag}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-4 min-h-[300px]">
        {editor && (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotePage;
