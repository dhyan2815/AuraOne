// components/tasks/TaskItem.tsx
import { format } from 'date-fns';
import { Calendar, Trash2, Pencil } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  completed: "completed" | "due";
  priority: 'low' | 'medium' | 'high';
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
  high: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
};

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) => {

  // Format the due date
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : '';

  // Check if the task is overdue by Time and its Date
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

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border ${isOverdue
        ? 'border-error-300 dark:border-error-800'
        : task.completed === "completed"
          ? 'border-success-300 dark:border-success-800'
          : 'border-slate-200 dark:border-slate-700'
      } shadow-sm p-4`}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {/* Task completion toggle */}
          <input
            type="checkbox"
            checked={task.completed === "completed"}
            onChange={onToggleComplete}
            className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
          />
        </div>

        <div className="flex-1 min-w-0 justify-between">
          <div className="flex items-center justify-between">
            <div>
              {/* Task Title */}
              <h4 className={`font-medium ${task.completed === "completed"
                  ? 'line-through text-slate-500 dark:text-slate-400'
                  : ''
                }`}>
                {task.title}
              </h4>

              {/* Task Description */}
              {task.description && (
                <p className={`text-sm mt-1 ${task.completed === "completed"
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-600 dark:text-slate-400'
                  }`}>
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                {/* For due date */}
                {task.dueDate && (
                  <div className={`flex items-center ${isOverdue
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-slate-500 dark:text-slate-400'
                    }`}>
                    <Calendar size={14} className="mr-1" />
                    {formattedDueDate}
                    {isOverdue && (
                      <span className="ml-1 font-medium">
                        (Overdue)
                      </span>
                    )}
                  </div>
                )}

                {/* For due time */}
                {task.dueTime && (
                  <div className={`flex items-center ${isOverdue
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-error-500 dark:text-error-400'
                    }`}>
                    <Calendar size={14} className='mr-1' />
                    {task.dueTime}
                    {isOverdue && (
                      <span className="ml-1 font-medium">
                        (Overdue)
                      </span>
                    )}
                  </div>
                )}

                {/* Display Priority */}
                <div className={`px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                </div>
              </div>
            </div>

            {/* Edit and Delete button */}
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(task.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                <Pencil size={18} />
              </button>
              <button onClick={() => onDelete(task.id)} className="p-2 text-error-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;