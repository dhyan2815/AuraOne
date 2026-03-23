import { Calendar, Clock, Flag, MoreVertical, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Task } from "../../hooks/useTasks";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  viewMode: "grid" | "list";
  onToggleComplete?: (taskId: string) => void;
}

const priorityConfig = {
  low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  medium: { color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  high: { color: 'text-error', bg: 'bg-error/10', border: 'border-error/20' },
};

const TaskCard = ({ task, viewMode, onToggleComplete }: TaskCardProps) => {
  const formattedDueDate = task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '';
  const dueTime = task.due_date ? format(new Date(task.due_date), 'p') : '';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const config = task.priority ? priorityConfig[task.priority] : priorityConfig.low;

  if (viewMode === "list") {
    return (
      <Link to={`/tasks/${task.id}`} className="block group">
        <div className={`glass p-4 rounded-2xl transition-all border border-transparent hover:border-primary/20 hover:bg-white/60 relative ${task.completed ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleComplete?.(task.id);
              }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                task.completed ? "bg-primary border-primary text-white" : "border-primary/20 group-hover:border-primary text-transparent"
              }`}
            >
              <CheckCircle size={14} className={task.completed ? "opacity-100" : "opacity-0"} />
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-black text-aurora-on-surface truncate ${task.completed ? "line-through opacity-50" : ""}`}>
                {task.title}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              {task.due_date && (
                <div className={`flex items-center text-[10px] font-bold ${isOverdue ? 'text-error' : 'text-aurora-on-surface-variant'}`}>
                  <Calendar size={12} className="mr-1" />
                  {formattedDueDate}
                </div>
              )}
              {task.priority && (
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.color} border ${config.border}`}>
                  {task.priority}
                </span>
              )}
              <MoreVertical size={14} className="text-aurora-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/tasks/${task.id}`} className="block h-full group">
      <motion.div 
        whileHover={{ y: -4 }}
        className={`glass h-full flex flex-col p-6 rounded-[2.5rem] transition-all border border-transparent hover:border-primary/20 hover:bg-white/60 relative ${task.completed ? "opacity-60" : ""} shadow-sm hover:shadow-xl hover:shadow-primary/5`}
      >
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleComplete?.(task.id);
            }}
            className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${
              task.completed ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass border border-primary/20 text-primary/20 hover:text-primary hover:border-primary"
            }`}
          >
            <CheckCircle size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            {isOverdue && <Flag size={14} className="text-error animate-pulse" />}
            <MoreVertical size={16} className="text-aurora-on-surface-variant opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
          </div>
        </div>

        <div className="flex-1 mb-6">
          <h3 className={`text-lg font-black leading-tight text-aurora-on-surface mb-2 ${task.completed ? "line-through opacity-50" : ""}`}>
            {task.title}
          </h3>
          <p className={`text-xs font-medium text-aurora-on-surface-variant line-clamp-2 ${task.completed ? "opacity-40" : ""}`}>
            {task.description || "Initialize registry details"}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-primary/5">
          <div className="flex flex-col gap-1">
            {task.due_date && (
              <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${isOverdue ? "text-error" : "text-aurora-on-surface-variant"}`}>
                <Clock size={12} className="mr-1.5" />
                {dueTime}
              </div>
            )}
            <div className="text-[9px] font-bold text-aurora-on-surface-variant/40 flex items-center">
              <Calendar size={10} className="mr-1" />
              {formattedDueDate || "No Deadline"}
            </div>
          </div>

          {task.priority && (
            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${config.bg} ${config.color} ${config.border}`}>
              {task.priority}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default TaskCard;

 