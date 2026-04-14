import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, updateTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import { Check, LayoutList, ChevronRight } from "lucide-react";
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
      toast.success(!completed ? "Task Completed" : "Task Reactivated");
      const updated = await getTasks(user.id);
      setTasks(updated);
    } catch {
      toast.error("Operation failed");
    }
  };

  const incomplete = tasks.filter((t) => !t.completed).slice(0, 3);
  const completedTasks = tasks.filter((t) => t.completed).slice(0, 1);
  const display = [...incomplete, ...completedTasks].slice(0, 3);

  if (display.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
        <div className="w-14 h-14 rounded-[1.25rem] bg-primary/5 glass flex items-center justify-center border border-primary/10">
          <LayoutList size={24} strokeWidth={2.5} className="text-primary/40" />
        </div>
        <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-text">All Caught Up</p>
            <p className="text-[10px] font-bold text-text-variant opacity-60">You have no pending tasks.</p>
        </div>
        <button
          onClick={() => navigate("/tasks/new")}
          className="btn-aurora py-2.5 px-6 text-[10px] shadow-lg shadow-primary/10"
        >
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {display.map((task, idx) => {
          const isCompleted = !!task.completed;
          return (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                isCompleted
                  ? "bg-primary/5 border-primary/5 opacity-50 grayscale"
                  : "glass border-primary/10 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle(task.id, task.completed); }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${
                  isCompleted
                    ? "bg-primary border-primary shadow-lg shadow-primary/30"
                    : "glass border-primary/20 hover:border-primary group-hover:scale-110"
                }`}
              >
                {isCompleted && <Check size={14} strokeWidth={4} className="text-white" />}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold tracking-tight transition-all duration-500 ${isCompleted ? "line-through text-text-variant italic" : "text-text"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-variant opacity-50">
                        {isCompleted
                            ? "Terminated"
                            : task.due_date
                            ? new Date(task.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : task.priority
                            ? task.priority + " tier"
                            : "Active Line"}
                    </span>
                    {!isCompleted && <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />}
                </div>
              </div>

              <ChevronRight size={14} className="text-text-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        onClick={() => navigate("/tasks")}
        className="w-full text-[9px] font-black text-primary/60 hover:text-primary text-center py-3 transition-all uppercase tracking-[0.4em] border-t border-primary/5 mt-2"
      >
        View All Tasks →
      </button>
    </div>
  );
};

export default TasksWidget;