import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, CheckCircle, Trash2 } from "lucide-react";

export interface ChunkCardProps {
  id: string;
  sourceType: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  similarity?: number;
  onDelete?: (id: string) => void;
  index?: number;
}

const ChunkCard: React.FC<ChunkCardProps> = ({
  id,
  sourceType,
  content,
  metadata = {},
  createdAt,
  similarity,
  onDelete,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group relative flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
            sourceType === 'note' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            sourceType === 'task' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {sourceType}
          </span>
          <h4 className="text-sm font-bold text-text truncate max-w-[200px] md:max-w-[400px]">
            {typeof metadata.title === 'string' && metadata.title.trim() !== '' ? metadata.title : (sourceType === 'note' ? 'Note Fragment' : 'Untitled')}
          </h4>
        </div>
        
        {similarity !== undefined ? (
          <span className="text-[9px] font-black text-primary/60 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
            {(similarity * 100).toFixed(1)}% Match
          </span>
        ) : (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {onDelete && (
              <button 
                onClick={() => onDelete(id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete Chunk"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Display Timing/Status metadata if available */}
      {sourceType === 'event' && (Boolean(metadata.start_time) || Boolean(metadata.end_time)) && (
        <div className="flex items-center gap-4 text-[10px] text-text-variant font-medium bg-black/20 p-2 rounded-lg w-fit">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-amber-400/70" />
            <span>
              {metadata.start_time ? (!isNaN(new Date(metadata.start_time as string | number).getTime()) ? new Date(metadata.start_time as string | number).toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
              }) : 'Invalid Date') : 'N/A'}
            </span>
          </div>
          {Boolean(metadata.end_time) && (
            <>
              <span className="opacity-40">→</span>
              <span>
                {!isNaN(new Date(metadata.end_time as string | number).getTime()) ? new Date(metadata.end_time as string | number).toLocaleString(undefined, {
                  hour: 'numeric', minute: '2-digit'
                }) : 'Invalid Date'}
              </span>
            </>
          )}
        </div>
      )}

      {sourceType === 'task' && (Boolean(metadata.priority) || Boolean(metadata.due_date)) && (
        <div className="flex items-center gap-4 text-[10px] text-text-variant font-medium bg-black/20 p-2 rounded-lg w-fit">
          {Boolean(metadata.priority) && (
            <div className="flex items-center gap-1.5 capitalize">
              <CheckCircle size={12} className={metadata.priority === 'high' ? 'text-red-400' : metadata.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'} />
              {String(metadata.priority)} Priority
            </div>
          )}
          {Boolean(metadata.due_date) && (
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-emerald-400/70" />
              Due: {!isNaN(new Date(metadata.due_date as string | number).getTime()) ? new Date(metadata.due_date as string | number).toLocaleDateString() : 'Invalid Date'}
            </div>
          )}
          {metadata.completed !== undefined && (
            <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${metadata.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-variant'}`}>
              {metadata.completed ? 'Completed' : 'Pending'}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-text/80 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
        {(() => {
          let text = content || '';
          if (sourceType === 'event' || sourceType === 'task') {
            const descMatch = text.match(/Description:\s*([\s\S]*)$/);
            if (descMatch && descMatch[1].trim()) {
              text = descMatch[1].trim();
            }
          } else if (text.length > 200 && sourceType === 'note') {
            text = text.substring(0, 200) + '...';
          }
          return text.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, (match) => {
            try {
              const parsed = new Date(match);
              if (!isNaN(parsed.getTime())) {
                return format(parsed, 'MMM d, yyyy h:mm a');
              }
            } catch { /* Return original match if date parsing fails */ }
            return match;
          });
        })()}
      </div>
      
      {createdAt && (
        <p className="text-[9px] text-text-variant font-mono opacity-40 flex justify-between items-center mt-1">
          <span>Created on {new Date(createdAt).toLocaleDateString()}</span>
        </p>
      )}
    </motion.div>
  );
};

export default ChunkCard;
