import { Calendar, Tag, MoreVertical, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Note } from "../../hooks/useNotes";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";

interface NoteCardProps {
  note: Note;
  viewMode: "grid" | "list";
}

const NoteCard = ({ note, viewMode }: NoteCardProps) => {
  const formattedDate = format(new Date(note.created_at), "MMM d, yyyy");

  const stripHtml = (html: string | null) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const cleanContent = stripHtml(note.content);

  if (viewMode === "list") {
    return (
      <Link to={`/notes/${note.id}`} className="block group">
        <Card className="transition-all hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-gray-800/60 relative">
            <CardContent className="p-4">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-primary/60 group-hover:text-primary transition-colors">
                        <Sparkles size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">
                            {note.title || 'Untitled Note'}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                            {cleanContent || "No additional content"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center text-xs font-medium text-slate-400">
                            <Calendar size={12} className="mr-1.5" />
                            {formattedDate}
                        </div>
                        {note.tags && note.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                            <Tag size={12} className="text-primary/40" />
                            <span className="text-xs font-medium text-primary/80 truncate max-w-[100px]">
                                {note.tags[0]}
                            </span>
                            </div>
                        )}
                        <MoreVertical size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/notes/${note.id}`} className="block h-full group">
      <motion.div whileHover={{ y: -5 }} className="h-full">
        <Card className="h-full flex flex-col transition-all shadow-sm hover:shadow-xl hover:shadow-primary/10">
            <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:scale-105 transition-all">
                        <Sparkles size={24} />
                    </div>
                    <button onClick={(e) => e.preventDefault()} className="p-2 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-primary hover:border-primary/20">
                        <MoreVertical size={16} />
                    </button>
                </div>

                <div className="flex-1 mb-8">
                    <h3 className="text-xl font-bold leading-tight text-text mb-3 group-hover:text-primary transition-colors">
                        {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-4 leading-relaxed">
                        {cleanContent || "No additional content to display..."}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-gray-700">
                    <div className="flex items-center text-xs font-medium text-slate-400">
                        <Calendar size={12} className="mr-2" />
                        {formattedDate}
                    </div>

                    <div className="flex gap-2">
                        {note.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-md bg-primary/10 text-[10px] font-bold uppercase text-primary">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default NoteCard;
