// components/widgets/TasksWidget.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks, updateTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";

const TasksWidget = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
    await updateTask(user.uid, id, { completed : newStatus });
    const updated = await getTasks(user.uid);
    setTasks(updated);
  };

  // Filter only incomplete tasks and limit to 3
  const displayTasks = tasks.filter((task) => task.completed !== "completed").slice(0, 3);

  // Count of remaining tasks
  const remainingTasksCount =
    tasks.filter((task) => task.completed !== "completed").length - displayTasks.length;

  return (
    <div className="space-y-4">
      {displayTasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            All tasks completed!
          </p>
          <Link
            to="/tasks"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            Add new tasks
          </Link>
        </div>
      ) : (
        <>
          {displayTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              {/* Task completion toggle */}
              <input
                type="checkbox"
                checked={task.completed === "completed"}
                onChange={() => handleToggleComplete(task.id, task.completed)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                <div className="mt-1">
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
                </div>
              </div>
            </div>
          ))}

          {remainingTasksCount > 0 && (
            <Link
              to="/tasks"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 pt-2 border-t border-slate-100 dark:border-slate-700"
            >
              View {remainingTasksCount} more{" "}
              {remainingTasksCount === 1 ? "task" : "tasks"}
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default TasksWidget;