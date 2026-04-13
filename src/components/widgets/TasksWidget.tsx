import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, updateTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import { Check, LayoutList } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const TasksWidget = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getTasks(user.id)
        .then(setTasks)
        .catch((e) => console.error("Failed to fetch tasks", e));
    }
  }, [user]);

  const handleToggle = async (id: string, completed: boolean | undefined) => {
    if (!user) return;
    try {
      await updateTask(id, { completed: !completed });
      toast.success(!completed ? "Task completed!" : "Task reactivated");
      const updated = await getTasks(user.id);
      setTasks(updated);
    } catch {
      toast.error("Update failed");
    }
  };

  const incomplete = tasks.filter((t) => !t.completed).slice(0, 3);
  const completed = tasks.filter((t) => t.completed).slice(0, 1);
  const display = [...incomplete, ...completed].slice(0, 3);

  if (display.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <LayoutList size={20} className="text-indigo-300" />
        </div>
        <p className="text-sm font-bold text-slate-600">Nothing pending</p>
        <p className="text-xs text-slate-400">Peace of mind achieved.</p>
        <button
          onClick={() => navigate("/tasks/new")}
          className="mt-2 bg-indigo-100 text-indigo-600 font-bold text-xs px-5 py-2 rounded-full hover:bg-indigo-200 transition-colors"
        >
          + Add Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {display.map((task, idx) => {
          const isCompleted = !!task.completed;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all group ${
                isCompleted
                  ? "bg-white/20 border-white/30 opacity-60"
                  : "bg-white/40 border-white/50 hover:shadow-lg hover:shadow-purple-100/50"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle(task.id, task.completed); }}
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  isCompleted
                    ? "bg-indigo-400 border-indigo-400"
                    : "border-indigo-300 hover:border-indigo-500"
                }`}
              >
                {isCompleted && <Check size={12} className="text-white" />}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isCompleted ? "line-through text-slate-400" : "text-text"}`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isCompleted
                    ? "Done"
                    : task.due_date
                    ? new Date(task.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : task.priority
                    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + " priority"
                    : "No due time"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        onClick={() => navigate("/tasks")}
        className="w-full text-xs font-bold text-indigo-500 hover:text-indigo-700 text-center py-2 transition-colors"
      >
        View all tasks →
      </button>
    </div>
  );
};

export default TasksWidget;