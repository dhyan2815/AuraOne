// components/widgets/TasksWidget.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTasks, updateTask, deleteTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import { Star, Pin, CheckCircle, Clock, Trash2 } from "lucide-react";
import toast from 'react-hot-toast';

const TasksWidget = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Fetch tasks on component mount
  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        const fetched = await getTasks(user.uid);
        setTasks(fetched);
      };
      fetchTasks();
    }
  }, [user]);

  // Event handler to toggle task completion status
  const handleToggleComplete = async (id: string, completed: string) => {
    if (!user) return;

    const newStatus = completed === "completed" ? "due" : "completed";

    try {
      await updateTask(user.uid, id, { completed: newStatus });
      toast.success(newStatus === "completed" ? "Task marked as completed!" : "Task marked as pending!");

      // Update local state
      const updated = await getTasks(user.uid);
      setTasks(updated);
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      toast.error("Failed to update task status");
    }
  };

  // Event handler to delete a task
  const handleDeleteTask = async (id: string, title: string) => {
    if (!user) return;

    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteTask(user.uid, id);
      toast.success("Task deleted successfully!");

      // Update local state
      const updated = await getTasks(user.uid);
      setTasks(updated);
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Event handler to navigate to task detail page
  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // Format time to 12-hour format for better readability
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);

      if (hour === 0) {
        return `12:${minutes} AM`;
      } else if (hour < 12) {
        return `${hour}:${minutes} AM`;
      } else if (hour === 12) {
        return `12:${minutes} PM`;
      } else {
        return `${hour - 12}:${minutes} PM`;
      }
    } catch {
      return timeString; // Return original if parsing fails
    }
  };

  // Filter only incomplete tasks, sort by pinned/starred priority, and limit to 3
  const displayTasks = tasks
    .filter((task) => task.completed !== "completed")
    .sort((a, b) => {
      // Pinned tasks first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then starred tasks
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;

      // Finally by creation date (newest first)
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    })
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {displayTasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <CheckCircle size={24} className="text-success-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">
            All tasks completed!
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Great job! Keep up the productivity.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-slate-100 dark:border-slate-700"
              onClick={() => handleTaskClick(task.id)}
            >
              {/* Task completion toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(task.id, task.completed);
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 mt-0.5"
              >
                <CheckCircle
                  size={20}
                  className={task.completed === "completed"
                    ? "text-success-500"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">{task.title}</p>
                  {task.starred && (
                    <Star size={12} className="text-warning-500 flex-shrink-0" fill="currentColor" />
                  )}
                  {task.pinned && (
                    <Pin size={12} className="text-primary-500 flex-shrink-0" fill="currentColor" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${task.priority === "high"
                      ? "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300"
                      : task.priority === "medium"
                        ? "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </span>
                  {task.dueTime && (
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={12} className="mr-1 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatTime(task.dueTime)}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Delete task button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id, task.title);
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 mt-0.5 text-slate-400 hover:text-error-600 dark:hover:text-error-400"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksWidget;