import { Calendar, Tag, MoreVertical, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Note } from "../../hooks/useNotes";
import { motion } from "framer-motion";

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
        <div className="glass p-4 rounded-2xl transition-all border border-transparent hover:border-primary/20 hover:bg-white/60 relative">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
              <Sparkles size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-aurora-on-surface truncate group-hover:text-primary transition-colors">
                {note.title || 'Draft Protocol'}
              </h3>
              <p className="text-[10px] font-bold text-aurora-on-surface-variant line-clamp-1 opacity-60">
                {cleanContent || "No data captured"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-aurora-on-surface-variant/40">
                <Calendar size={12} className="mr-1.5" />
                {formattedDate}
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag size={12} className="text-primary/30" />
                  <span className="text-[9px] font-black uppercase text-primary/40 truncate max-w-[100px]">
                    {note.tags[0]}
                  </span>
                </div>
              )}
              <MoreVertical size={14} className="text-aurora-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/notes/${note.id}`} className="block h-full group">
      <motion.div 
        whileHover={{ y: -4 }}
        className="glass h-full flex flex-col p-6 rounded-[2.5rem] transition-all border border-transparent hover:border-primary/20 hover:bg-white/60 relative shadow-sm hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-primary/30 group-hover:text-primary group-hover:aurora-glow transition-all">
            <Sparkles size={24} />
          </div>
          <button className="p-2 rounded-xl glass border border-primary/5 text-aurora-on-surface-variant opacity-0 group-hover:opacity-100 transition-all hover:text-primary hover:border-primary/20">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="flex-1 mb-8">
          <h3 className="text-xl font-black leading-tight text-aurora-on-surface mb-3 group-hover:text-primary transition-colors">
            {note.title || 'Draft Protocol'}
          </h3>
          <p className="text-xs font-medium text-aurora-on-surface-variant line-clamp-4 leading-relaxed opacity-70">
            {cleanContent || "System awaiting data input..."}
          </p>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-primary/5">
          <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface-variant/40">
            <Calendar size={12} className="mr-2" />
            {formattedDate}
          </div>

          <div className="flex gap-1.5">
            {note.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-lg glass border border-primary/10 text-[9px] font-black uppercase tracking-wider text-primary/60">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default NoteCard;