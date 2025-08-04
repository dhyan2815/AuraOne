import { Calendar, Tag, MoreVertical, Star, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toggleNoteStar, toggleNotePin } from "../../hooks/useNotes";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  starred?: boolean;
  pinned?: boolean;
}

interface NoteCardProps {
  note: Note;
  viewMode: "grid" | "list";
}

const NoteCard = ({ note, viewMode }: NoteCardProps) => {
  const { user } = useAuth();
  const formattedDate = format(new Date(note.createdAt), "MMM d, yyyy");

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      await toggleNoteStar(user.uid, note.id, !note.starred);
      toast.success(note.starred ? "Note unstarred!" : "Note starred!");
    } catch (error) {
      console.error("Failed to toggle star:", error);
      toast.error("Failed to update note");
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      await toggleNotePin(user.uid, note.id, !note.pinned);
      toast.success(note.pinned ? "Note unpinned!" : "Note pinned!");
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      toast.error("Failed to update note");
    }
  };

  if (viewMode === "list") {
    return (
      <Link to={`/notes/${note.id}`} className="block">
        <div className="card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
          {note.pinned && (
            <div className="absolute top-2 right-2">
              <Pin size={14} className="text-primary-500" fill="currentColor" />
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium truncate">{note.title}</h3>
                {note.starred && (
                  <Star size={16} className="text-warning-500" fill="currentColor" />
                )}
              </div>
              <div
                className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4"
              >
                {note.content}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {formattedDate}
              </div>

              {note.tags?.length > 0 && (
                <div className="flex items-center">
                  <Tag size={14} className="mr-1" />
                  <span className="max-w-[150px] truncate">
                    {note.tags.join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleStar}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Star 
                    size={16} 
                    className={note.starred 
                      ? "text-warning-500" 
                      : "text-slate-400 hover:text-warning-500"
                    } 
                    fill={note.starred ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleTogglePin}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Pin 
                    size={16} 
                    className={note.pinned 
                      ? "text-primary-500" 
                      : "text-slate-400 hover:text-primary-500"
                    } 
                    fill={note.pinned ? "currentColor" : "none"}
                  />
                </button>
                <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/notes/${note.id}`} className="block h-full">
      <div className="card h-full flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
        {note.pinned && (
          <div className="absolute top-2 right-2">
            <Pin size={14} className="text-primary-500" fill="currentColor" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium">{note.title}</h3>
            {note.starred && (
              <Star size={16} className="text-warning-500" fill="currentColor" />
            )}
          </div>
          <div
            className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-2"
          >
            {note.content}  
          </div> 
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formattedDate}
          </div>

          <div className="flex items-center gap-2">
            {note.tags?.length > 0 && (
              <div className="flex items-center">
                <Tag size={14} className="mr-1" />
                <span className="max-w-[100px] truncate">
                  {note.tags.join(", ")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleStar}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Star 
                  size={14} 
                  className={note.starred 
                    ? "text-warning-500" 
                    : "text-slate-400 hover:text-warning-500"
                  } 
                  fill={note.starred ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={handleTogglePin}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Pin 
                  size={14} 
                  className={note.pinned 
                    ? "text-primary-500" 
                    : "text-slate-400 hover:text-primary-500"
                  } 
                  fill={note.pinned ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;