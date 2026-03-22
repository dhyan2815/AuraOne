import { Calendar, Tag, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Note } from "../../hooks/useNotes"; // Import the centralized Note interface

interface NoteCardProps {
  note: Note;
  viewMode: "grid" | "list";
}

const NoteCard = ({ note, viewMode }: NoteCardProps) => {
  const formattedDate = format(new Date(note.created_at), "MMM d, yyyy");

  // Function to strip HTML tags and get clean text
  const stripHtml = (html: string | null) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const cleanContent = stripHtml(note.content);

  if (viewMode === "list") {
    return (
      <Link to={`/notes/${note.id}`} className="block">
        <div className="card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium truncate">{note.title || 'Untitled Note'}</h3>
              </div>
              <div
                className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4"
              >
                {cleanContent}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              <div className="flex items-center flex-shrink-0">
                <Calendar size={14} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">{formattedDate}</span>
              </div>

              {note.tags?.length > 0 && (
                <div className="flex items-center flex-shrink-0">
                  <Tag size={14} className="mr-1 flex-shrink-0" />
                  <span className="max-w-[150px] truncate">
                    {note.tags.join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium">{note.title || 'Untitled Note'}</h3>
          </div>
          <div
            className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-2"
          >
            {cleanContent}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center flex-shrink-0">
            <Calendar size={14} className="mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {note.tags?.length > 0 && (
              <div className="flex items-center flex-shrink-0">
                <Tag size={14} className="mr-1 flex-shrink-0" />
                <span className="max-w-[100px] truncate">
                  {note.tags.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;