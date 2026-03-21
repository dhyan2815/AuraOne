import { Calendar, Clock, Flag, MoreVertical, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Task } from "../../hooks/useTasks"; // Import the centralized Task interface
import { useAuth } from "../../hooks/useAuth";

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
  const { user } = useAuth();
  const formattedDueDate = task.due_date
    ? format(new Date(task.due_date), 'MMM d, yyyy')
    : '';

  const formattedCreatedDate = task.created_at
    ? format(new Date(task.created_at), 'MMM d, yyyy')
    : '';

  const dueTime = task.due_date ? format(new Date(task.due_date), 'p') : '';

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  if (viewMode === "list") {
    return (
      <Link to={`/tasks/${task.id}`} className="block">
        <div className="card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
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
                    className={task.completed
                      ? "text-success-500"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }
                  />
                </button>
                <h3 className={`text-lg font-medium truncate ${
                  task.completed
                    ? "line-through text-slate-500 dark:text-slate-400"
                    : ""
                }`}>
                  {task.title}
                </h3>
              </div>
              <div className={`text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 ${
                task.completed
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : ""
              }`}>
                {task.description || "No description"}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              {task.due_date && (
                <div className={`flex items-center flex-shrink-0 ${isOverdue
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-slate-500 dark:text-slate-400'
                }`}>
                  <Calendar size={14} className="mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">{formattedDueDate}</span>
                  {isOverdue && (
                    <span className="ml-1 font-medium whitespace-nowrap">(Overdue)</span>
                  )}
                </div>
              )}

              {dueTime && (
                <div className={`flex items-center flex-shrink-0 ${isOverdue
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-slate-500 dark:text-slate-400'
                }`}>
                  <Clock size={14} className="mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">{dueTime}</span>
                </div>
              )}

              {task.priority && (
                <div className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
    <Link to={`/tasks/${task.id}`} className="block h-full">
      <div className="card h-full flex flex-col hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
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
                className={task.completed
                  ? "text-success-500"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }
              />
            </button>
            <h3 className={`text-lg font-medium ${
              task.completed
                ? "line-through text-slate-500 dark:text-slate-400"
                : ""
            }`}>
              {task.title}
            </h3>
          </div>
          <div className={`text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 ${
            task.completed
              ? "line-through text-slate-400 dark:text-slate-500"
              : ""
          }`}>
            {task.description || "No description"}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            {task.due_date && (
              <div className={`flex items-center flex-shrink-0 ${isOverdue
                ? 'text-error-600 dark:text-error-400'
                : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Calendar size={14} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">{formattedDueDate}</span>
              </div>
            )}
            {dueTime && (
              <div className={`flex items-center flex-shrink-0 ${isOverdue
                ? 'text-error-600 dark:text-error-400'
                : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Clock size={14} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">{dueTime}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.priority && (
              <div className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            )}
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
 