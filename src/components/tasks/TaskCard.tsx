import { Calendar, Clock, Flag, MoreVertical, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  dueTime?: string;
  completed: "completed" | "due";
  priority: "low" | "medium" | "high";
  createdAt?: string;
}

interface TaskCardProps {
  task: Task;
  viewMode: "grid" | "list";
  onToggleComplete?: (taskId: string) => void;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
  high: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
};

const TaskCard = ({ task, viewMode, onToggleComplete }: TaskCardProps) => {
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : '';
  
  const formattedCreatedDate = task.createdAt
    ? format(new Date(task.createdAt), 'MMM d, yyyy')
    : '';

  const isOverdue = task.dueDate && task.dueTime && (() => {
    try {
      // HTML time input provides 24-hour format (HH:MM)
      const [hours, minutes] = task.dueTime.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      if (hour !== undefined && minute !== undefined) {
        const dueDateTime = new Date(`${task.dueDate}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        return dueDateTime < new Date() && task.completed === "due";
      }
      
      return false;
    } catch {
      return false;
    }
  })();

  if (viewMode === "list") {
    return (
      <Link to={`/tasks/${task.id}`} className="block">
        <div className="card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleComplete?.(task.id);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <CheckCircle 
                    size={16} 
                    className={task.completed === "completed" 
                      ? "text-success-500" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    } 
                  />
                </button>
                <h3 className={`text-lg font-medium truncate ${
                  task.completed === "completed" 
                    ? "line-through text-slate-500 dark:text-slate-400" 
                    : ""
                }`}>
                  {task.title}
                </h3>
              </div>
              <div className={`text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 ${
                task.completed === "completed" 
                  ? "line-through text-slate-400 dark:text-slate-500" 
                  : ""
              }`}>
                {task.description || "No description"}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              {task.dueDate && (
                <div className={`flex items-center ${isOverdue
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-slate-500 dark:text-slate-400'
                }`}>
                  <Calendar size={14} className="mr-1" />
                  {formattedDueDate}
                  {isOverdue && (
                    <span className="ml-1 font-medium">(Overdue)</span>
                  )}
                </div>
              )}

              {task.dueTime && (
                <div className={`flex items-center ${isOverdue
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-slate-500 dark:text-slate-400'
                }`}>
                  <Clock size={14} className="mr-1" />
                  {task.dueTime}
                </div>
              )}

              <div className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>

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
    <Link to={`/tasks/${task.id}`} className="block h-full">
      <div className="card h-full flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleComplete?.(task.id);
              }}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <CheckCircle 
                size={16} 
                className={task.completed === "completed" 
                  ? "text-success-500" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                } 
              />
            </button>
            <h3 className={`text-lg font-medium ${
              task.completed === "completed" 
                ? "line-through text-slate-500 dark:text-slate-400" 
                : ""
            }`}>
              {task.title}
            </h3>
          </div>
          <div className={`text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 ${
            task.completed === "completed" 
              ? "line-through text-slate-400 dark:text-slate-500" 
              : ""
          }`}>
            {task.description || "No description"}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className={`flex items-center ${isOverdue
                ? 'text-error-600 dark:text-error-400'
                : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Calendar size={14} className="mr-1" />
                {formattedDueDate}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
            {isOverdue && (
              <Flag size={14} className="text-error-500" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard; 