import { Calendar, Tag, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

interface NoteCardProps {
  note: Note;
  viewMode: "grid" | "list";
}

const NoteCard = ({ note, viewMode }: NoteCardProps) => {
  const formattedDate = format(new Date(note.createdAt), "MMM d, yyyy");

  if (viewMode === "list") {
    return (
      <Link to={`/notes/${note.id}`} className="block">
        <div className="card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate">{note.title}</h3>
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

              <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/notes/${note.id}`} className="block h-full">
      <div className="card h-full flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">{note.title}</h3>
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

          {note.tags?.length > 0 && (
            <div className="flex items-center">
              <Tag size={14} className="mr-1" />
              <span className="max-w-[100px] truncate">
                {note.tags.join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;