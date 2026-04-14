import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, Flag, Calendar, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, updateTask, deleteTask, Task } from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const FILTERS = ["All", "Today", "Upcoming", "Completed"];

const PRIORITY_STYLE: Record<string, string> = {
  high:   "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
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
    toast.success(!completed ? "Task completed" : "Task reactivated");
    loadTasks();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await deleteTask(id);
    toast.success("Task deleted");
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
  const rowVariant = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } };

  const TaskRow = ({ task }: { task: Task }) => {
    const done = !!task.completed;
    const priorityClass = task.priority ? PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low : PRIORITY_STYLE.low;
    return (
      <motion.div
        variants={rowVariant}
        onClick={() => navigate(`/tasks/${task.id}`)}
        className={`glass rounded-2xl p-4 flex items-center gap-5 group cursor-pointer hover:translate-x-1.5 transition-all duration-300 border border-primary/5 ${done ? "opacity-50 grayscale" : ""}`}
      >
        {/* Circular checkbox */}
        <button
          onClick={(e) => handleToggle(task.id, task.completed, e)}
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 shadow-lg ${
            done ? "bg-primary border-primary shadow-primary/20" : "border-primary/30 group-hover:border-primary group-hover:shadow-primary/10"
          }`}
        >
          {done && <Check size={12} className="text-white" strokeWidth={4} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-text text-sm sm:text-base leading-snug ${done ? "line-through opacity-60" : ""}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            {task.due_date && (
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-variant/60 flex items-center gap-1.5">
                <Calendar size={12} className="text-primary" />{new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {!task.due_date && (
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-variant/40 flex items-center gap-1.5">
                <Clock size={12} className="text-primary/40" />No Deadline
              </span>
            )}
            {task.description && (
              <span className="text-[10px] px-3 py-1 rounded-full glass border-primary/5 text-text-variant font-bold truncate max-w-[140px] hidden sm:block">
                {task.description}
              </span>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        {task.priority && !done && (
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 border ${priorityClass}`}>
            <Flag size={9} strokeWidth={3} />{task.priority}
          </span>
        )}

        {/* Delete */}
        <button
          onClick={(e) => handleDelete(task.id, e)}
          className="p-2 text-text-variant/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </motion.div>
    );
  };

  interface GroupProps { dot: string; label: string; list: Task[]; }
  const Group = ({ dot, label, list }: GroupProps) => (
    <AnimatePresence mode="popLayout">
      {list.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5 px-4">
            <div className={`w-2 h-2 rounded-full shadow-lg ${dot}`} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-variant/60">{label}</h3>
          </div>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {list.map((t) => <TaskRow key={t.id} task={t} />)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="app-page">
      {/* ── Hero & Controls ── */}
      <section className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -25 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Workboard</h1>
              <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black tracking-widest uppercase border border-primary/20 shadow-lg shadow-primary/5 transition-colors duration-500">
                {tasks.filter((t) => !t.completed).length} IN PROGRESS
              </div>
            </div>
            <p className="text-sm text-text-variant font-medium mt-2 leading-relaxed max-w-xl">Stay organized and keep track of your daily goals and priorities.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-stretch gap-4 sm:items-center sm:flex-row flex-col"
          >
            {/* Filter tabs */}
            <div className="flex items-center gap-1 rounded-[1.25rem] border border-primary/10 glass p-1 shadow-sm transition-colors duration-500">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeFilter === f
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.05] z-10"
                      : "text-text-variant hover:text-primary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate("/tasks/new")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-2xl font-black shadow-2xl shadow-primary/20 text-xs hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
            >
              <Plus size={16} strokeWidth={4} />
              ADD TASK
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Task Groups ── */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-primary/10 glass transition-colors duration-500"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary/40 mb-8 border border-primary/5">
            <Plus size={40} strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black text-text tracking-tight">No Tasks Found</h2>
          <p className="text-sm text-text-variant mt-3 max-w-xs text-center leading-relaxed font-medium">Create your first task to start organizing your daily goals.</p>
          <button
            onClick={() => navigate("/tasks/new")}
            className="mt-10 btn-aurora px-12 py-4"
          >
            Create New Task
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <Group dot="bg-red-500 shadow-red-500/40"     label="High Priority" list={highPriority} />
          <Group dot="bg-primary shadow-primary/40"     label="In Progress"    list={activeFlow} />
          <Group dot="bg-text-variant shadow-lg"   label="Completed Tasks"     list={achieved} />
        </div>
      )}
    </div>
  );
};

export default Tasks;
