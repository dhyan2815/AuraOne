import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, Flag, Calendar, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, updateTask, deleteTask, Task } from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const FILTERS = ["All", "Today", "Upcoming", "Completed"];

const PRIORITY_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-500",
  medium: "bg-amber-50 text-amber-600",
  low:    "bg-emerald-50 text-emerald-600",
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadTasks = () => {
    if (user) getTasks(user.id).then(setTasks);
  };

  useEffect(() => { loadTasks(); }, [user]);

  const handleToggle = async (id: string, completed: boolean | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await updateTask(id, { completed: !completed });
    toast.success(!completed ? "Objective achieved! ✦" : "Reactivated");
    loadTasks();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await deleteTask(id);
    toast.success("Task removed");
    loadTasks();
  };

  const today = new Date().toDateString();
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (activeFilter === "Completed") return !!t.completed;
      if (activeFilter === "Today") return t.due_date && new Date(t.due_date).toDateString() === today && !t.completed;
      if (activeFilter === "Upcoming") return t.due_date && new Date(t.due_date).toDateString() !== today && !t.completed;
      return true;
    });
  }, [tasks, activeFilter, today]);

  const highPriority = filtered.filter((t) => t.priority === "high" && !t.completed);
  const activeFlow   = filtered.filter((t) => t.priority !== "high" && !t.completed);
  const achieved     = filtered.filter((t) => !!t.completed);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const row = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } };

  const TaskRow = ({ task }: { task: Task }) => {
    const done = !!task.completed;
    const priorityClass = task.priority ? PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low : PRIORITY_STYLE.low;
    return (
      <motion.div
        variants={row}
        onClick={() => navigate(`/tasks/${task.id}`)}
        className={`bg-white/25 backdrop-blur-[40px] border border-white/30 rounded-[2rem] p-5 flex items-center gap-6 group cursor-pointer hover:translate-x-1 transition-all duration-300 ${done ? "opacity-60" : ""}`}
      >
        {/* Circular checkbox */}
        <button
          onClick={(e) => handleToggle(task.id, task.completed, e)}
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
            done ? "bg-indigo-500 border-indigo-500" : "border-indigo-300 group-hover:border-indigo-500"
          }`}
        >
          {done && <Check size={13} className="text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-on-surface text-lg ${done ? "line-through text-slate-400" : ""}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {task.due_date && (
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Calendar size={12} />{new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {!task.due_date && (
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock size={12} />No due date
              </span>
            )}
            {task.description && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 truncate max-w-[120px]">
                {task.description.slice(0, 20)}
              </span>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        {task.priority && (
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${priorityClass}`}>
            <Flag size={10} />{task.priority}
          </span>
        )}

        {/* Delete */}
        <button
          onClick={(e) => handleDelete(task.id, e)}
          className="p-2 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </motion.div>
    );
  };

  interface GroupProps { dot: string; label: string; list: Task[]; }
  const Group = ({ dot, label, list }: GroupProps) => (
    <AnimatePresence>
      {list.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface/60">{label}</h3>
          </div>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {list.map((t) => <TaskRow key={t.id} task={t} />)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen px-10 pt-12 pb-16 max-w-6xl mx-auto">
      {/* ── Hero & Controls ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
              Objective Registry
            </h1>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-widest uppercase">
              {tasks.filter((t) => !t.completed).length} Active
            </span>
          </div>
          <p className="text-slate-500 font-medium">Curate your workflow and maintain tactical alignment.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 flex-wrap"
        >
          {/* Filter tabs */}
          <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-sm">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === f
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* New Task CTA */}
          <button
            onClick={() => navigate("/tasks/new")}
            className="flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-500 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_10px_20px_-5px_rgba(73,83,188,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-sm"
          >
            <Plus size={18} />
            New Task
          </button>
        </motion.div>
      </div>

      {/* ── Task Groups ── */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <p className="text-2xl font-bold text-slate-500">No objectives yet</p>
          <p className="text-sm text-slate-400">Create your first task to begin the registry.</p>
          <button
            onClick={() => navigate("/tasks/new")}
            className="mt-4 px-8 py-3 rounded-full text-white font-bold shadow-xl bg-gradient-to-r from-indigo-600 to-purple-500"
          >
            + New Task
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <Group dot="bg-red-400"     label="High Priority Objectives" list={highPriority} />
          <Group dot="bg-amber-400"   label="Active Flow"              list={activeFlow} />
          <Group dot="bg-slate-300"   label="Recently Achieved"        list={achieved} />
        </div>
      )}
    </div>
  );
};

export default Tasks;
