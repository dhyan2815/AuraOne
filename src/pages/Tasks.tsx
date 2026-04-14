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
    toast.success(!completed ? "Task completed" : "Reactivated");
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
        className={`bg-white/25 backdrop-blur-[40px] border border-white/30 rounded-xl p-3 flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-all duration-300 ${done ? "opacity-60" : ""}`}
      >
        {/* Circular checkbox */}
        <button
          onClick={(e) => handleToggle(task.id, task.completed, e)}
          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
            done ? "bg-indigo-500 border-indigo-500" : "border-indigo-300 group-hover:border-indigo-500"
          }`}
        >
          {done && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-text text-sm ${done ? "line-through text-slate-400" : ""}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
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
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${priorityClass}`}>
            <Flag size={9} />{task.priority}
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
          <div className="flex items-center gap-2 mb-4 px-3">
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-text/60">{label}</h3>
          </div>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {list.map((t) => <TaskRow key={t.id} task={t} />)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="app-page-tight flex flex-col gap-8">
      {/* ── Hero & Controls ── */}
      <section className="app-page-header gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-text">Tasks</h1>
            <div className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase border border-indigo-500/20">
              {tasks.filter((t) => !t.completed).length} Total
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium opacity-80">Track work by priority, due date, and completion status.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          {/* Filter tabs */}
          <div className="flex flex-wrap bg-white/40 backdrop-blur-xl p-1 rounded-2xl border border-white/50 shadow-sm shadow-indigo-500/5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeFilter === f
                    ? "bg-white text-indigo-600 shadow-md shadow-indigo-500/10 scale-[1.02]"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/tasks/new")}
            className="flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-500 text-white px-5 py-2.5 rounded-2xl font-black shadow-lg shadow-indigo-500/20 text-xs hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            New
          </button>
        </motion.div>
      </section>

      {/* ── Task Groups ── */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center py-32 rounded-[2rem] border-2 border-dashed border-indigo-200/50 bg-indigo-50/10"
        >
          <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-indigo-500/5 flex items-center justify-center text-indigo-500 mb-6">
            <Plus size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Create your first task</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-[240px]">Add a task to start organizing your work.</p>
          <button
            onClick={() => navigate("/tasks/new")}
            className="mt-8 px-10 py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-500 hover:scale-105 active:scale-95 transition-all"
          >
            Create Task
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <Group dot="bg-red-400"     label="High Priority" list={highPriority} />
          <Group dot="bg-amber-400"   label="Open Tasks"              list={activeFlow} />
          <Group dot="bg-slate-300"   label="Completed"        list={achieved} />
        </div>
      )}
    </div>
  );
};

export default Tasks;




