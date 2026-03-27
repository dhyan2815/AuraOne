import { Calendar, Clock, Flag, MoreVertical, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Task } from "../../hooks/useTasks";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";

interface TaskCardProps {
  task: Task;
  viewMode: "grid" | "list";
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

const priorityConfig = {
    low: {
      text: 'text-slate-500',
      bg: 'bg-slate-100 dark:bg-gray-700',
      name: 'Low'
    },
    medium: {
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-400/10',
      name: 'Medium'
    },
    high: {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-500/10',
      name: 'High'
    },
};

const TaskCard = ({ task, viewMode, onToggleComplete }: TaskCardProps) => {
  const formattedDueDate = task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '';
  const dueTime = task.due_date ? format(new Date(task.due_date), 'p') : '';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const config = task.priority ? priorityConfig[task.priority] : priorityConfig.low;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleComplete?.(task.id, !task.completed);
  };

  if (viewMode === "list") {
    return (
      <Link to={`/tasks/${task.id}`} className="block group">
        <Card className={`transition-all hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-gray-800/60 relative ${task.completed ? "opacity-60" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <button onClick={handleToggle} className="flex-shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? "bg-primary border-primary" : "border-slate-300 dark:border-gray-600 group-hover:border-primary"}`}>
                  {task.completed && <CheckCircle size={14} className="text-white" />}
                </div>
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold text-text truncate ${task.completed ? "line-through" : ""}`}>
                  {task.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                {task.due_date && (
                  <div className={`flex items-center ${isOverdue ? 'text-red-500' : ''}`}>
                    <Calendar size={12} className="mr-1.5" />
                    {formattedDueDate}
                  </div>
                )}
                {task.priority && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${config.bg} ${config.text}`}>
                    {config.name}
                  </span>
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
    <Link to={`/tasks/${task.id}`} className="block h-full group">
      <motion.div whileHover={{ y: -5 }} className="h-full">
        <Card className={`h-full flex flex-col transition-all shadow-sm hover:shadow-xl hover:shadow-primary/10 ${task.completed ? "opacity-60" : ""}`}>
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-4">
              <button
                onClick={handleToggle}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  task.completed
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-300 dark:text-gray-600 hover:text-primary hover:border-primary"
                }`}
              >
                <CheckCircle size={18} />
              </button>
              <div className="flex items-center gap-2">
                {isOverdue && <Flag size={14} className="text-red-500" title="Overdue" />}
                <MoreVertical size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </div>

            <div className="flex-1 mb-6">
              <h3 className={`text-lg font-bold leading-tight text-text mb-2 ${task.completed ? "line-through" : ""}`}>
                {task.title}
              </h3>
              <p className={`text-sm text-slate-500 line-clamp-2`}>
                {task.description || "No description provided."}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-gray-700 space-y-3">
              {task.due_date && (
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Deadline</span>
                  <span className={isOverdue ? "text-red-500 font-bold" : "font-bold text-text"}>
                    {formattedDueDate}
                  </span>
                </div>
              )}
              {task.priority && (
                 <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                   <span>Priority</span>
                   <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${config.bg} ${config.text}`}>
                     {config.name}
                   </span>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default TaskCard;
