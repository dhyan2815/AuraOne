import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

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

// Source chip colours match each section: Notes coral, Tasks yellow, Events blue.
const SOURCE_COLOR: Record<string, string> = {
  note: "rgb(var(--notes))",
  task: "rgb(var(--tasks))",
  event: "rgb(var(--events))",
};

const fmtDate = (v: unknown, opts: Intl.DateTimeFormatOptions) => {
  const d = new Date(v as string | number);
  return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString(undefined, opts);
};

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
  const title =
    typeof metadata.title === "string" && metadata.title.trim() !== ""
      ? metadata.title
      : sourceType === "note" ? "Note fragment" : "Untitled";

  // Short context line built from the metadata the chunk already carries.
  const meta: string[] = [];
  if (sourceType === "event" && (metadata.start_time || metadata.end_time)) {
    const start = metadata.start_time
      ? fmtDate(metadata.start_time, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : "N/A";
    meta.push(metadata.end_time ? `${start} → ${fmtDate(metadata.end_time, { hour: "numeric", minute: "2-digit" })}` : start);
  }
  if (sourceType === "task") {
    if (metadata.priority) meta.push(`${String(metadata.priority)} priority`);
    if (metadata.due_date) meta.push(`due ${fmtDate(metadata.due_date, { dateStyle: "medium" })}`);
    if (metadata.completed !== undefined) meta.push(metadata.completed ? "completed" : "pending");
  }

  let text = content || "";
  if (sourceType === "event" || sourceType === "task") {
    const descMatch = text.match(/Description:\s*([\s\S]*)$/);
    if (descMatch && descMatch[1].trim()) text = descMatch[1].trim();
  } else if (text.length > 200 && sourceType === "note") {
    text = text.substring(0, 200) + "...";
  }
  text = text.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, (match) => {
    try {
      const parsed = new Date(match);
      if (!isNaN(parsed.getTime())) return format(parsed, "MMM d, yyyy h:mm a");
    } catch { /* Return original match if date parsing fails */ }
    return match;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group grid grid-cols-[72px_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[84px_minmax(0,1fr)] [&+&]:shadow-[0_-1px_0_rgb(var(--step))]"
    >
      <div>
        {similarity !== undefined ? (
          <>
            <span className="lm-num block text-[40px]">{similarity.toFixed(2).replace(/^0/, "")}</span>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-step" role="img" aria-label={`${(similarity * 100).toFixed(0)}% match`}>
              <i className="block h-full rounded-full bg-know" style={{ width: `${Math.max(0, Math.min(1, similarity)) * 100}%` }} />
            </div>
          </>
        ) : (
          createdAt && <span className="lm-muted">{new Date(createdAt).toLocaleDateString()}</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="lm-chip capitalize !text-[#1F211E]" style={{ background: SOURCE_COLOR[sourceType] ?? "rgb(var(--step))" }}>
            {sourceType}
          </span>
          <b className="min-w-0 truncate">{title}</b>
          {meta.length > 0 && <span className="lm-muted">{meta.join(" · ")}</span>}
          {onDelete && similarity === undefined && (
            <button
              onClick={() => onDelete(id)}
              className="lm-btn lm-btn-soft lm-btn-sm ml-auto !px-3 !py-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              aria-label="Delete chunk"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap text-ink2">{text}</p>
      </div>
    </motion.div>
  );
};

export default ChunkCard;
