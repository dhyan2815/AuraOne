import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  Trash2,
  Check,
  Flag,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  NewTask
} from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/structure/Logo";

const TaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchTask = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (id === "new") {
          setTitle("New Task");
          setDescription("");
          setDueDate("");
          setDueTime("");
          setPriority("medium");
          setCompleted(false);
          setCreatedAt(new Date().toISOString());
        } else if (id) {
          const foundTask = await getTaskById(id);
          if (foundTask) {
            setTitle(foundTask.title);
            setDescription(foundTask.description || "");
            if (foundTask.due_date) {
              const dateObj = new Date(foundTask.due_date);
              setDueDate(format(dateObj, 'yyyy-MM-dd'));
              setDueTime(format(dateObj, 'HH:mm'));
            }
            setPriority(foundTask.priority || "medium");
            setCompleted(foundTask.completed || false);
            setCreatedAt(foundTask.created_at);
          } else {
            toast.error("Objective not found");
            navigate("/tasks");
          }
        }
      } catch {
        toast.error("Uplink failed");
        navigate("/tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!user) return;

    let finalDueDate: string | undefined = undefined;
    if (dueDate) {
      if (dueTime) {
        finalDueDate = new Date(`${dueDate}T${dueTime}`).toISOString();
      } else {
        finalDueDate = new Date(`${dueDate}T00:00:00`).toISOString();
      }
    }

    const taskData: NewTask = {
      title: title.trim() || "Untitled Protocol",
      description: description.trim(),
      due_date: finalDueDate,
      priority,
      completed,
    };

    try {
      setIsSaving(true);
      if (id === "new") {
        await createTask(user.id, taskData);
        toast.success("Task Saved");
      } else if (id) {
        await updateTask(id, taskData);
        toast.success("Task Updated");
      }
      navigate("/tasks");
    } catch {
      toast.error("Transmission interruption");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id || id === "new") {
      navigate("/tasks");
      return;
    }
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      await deleteTask(id);
      toast.success("Task Deleted");
      navigate("/tasks");
    } catch {
      toast.error("Purge system error");
    }
  };

  const isOverdue = dueDate && !completed && (() => {
    try {
      const targetDate = dueTime ? new Date(`${dueDate}T${dueTime}`) : new Date(`${dueDate}T23:59:59`);
      return targetDate < new Date();
    } catch {
      return false;
    }
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500">
          <RotateCw className="text-primary animate-spin" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 animate-pulse">Loading Task...</p>
      </div>
    );
  }

  return (
    <div className="app-page-tight space-y-6 sm:space-y-10 px-4 sm:px-0">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="flex items-start gap-4 sm:gap-8 group flex-1">
          <button
            onClick={() => navigate("/tasks")}
            className="mt-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass border border-primary/5 text-text-variant hover:text-primary hover:border-primary/20 transition-all active:scale-95 shadow-xl flex-shrink-0"
          >
            <ArrowLeft size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>
          <div className="flex-1 space-y-2 sm:space-y-4 min-w-0">
            <div className="flex items-center gap-1.5 text-primary">
              <Logo iconOnly iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] ml-1">Task Details</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl sm:text-3xl lg:text-5xl font-extrabold bg-transparent border-0 outline-none w-full text-text placeholder:text-text-variant/10 tracking-tighter leading-none truncate"
              placeholder="Enter Task Title..."
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            {createdAt && (
              <div className="flex items-center text-[9px] sm:text-[10px] font-black text-text-variant uppercase tracking-[0.2em] opacity-60">
                <Calendar size={10} className="mr-1.5 text-primary sm:w-[12px] sm:h-[12px]" />
                Created On: {format(new Date(createdAt), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:self-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex-1 sm:flex-initial whitespace-nowrap"
          >
            {isSaving ? <RotateCw className="animate-spin sm:w-[18px] sm:h-[18px]" size={14} strokeWidth={3} /> : <Save size={14} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" />}
            Save Task
          </button>

          <button
            onClick={handleDelete}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass border border-primary/5 text-text-variant hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 shadow-lg shadow-red-500/5 flex-shrink-0"
            aria-label="Delete task"
          >
            <Trash2 size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8 space-y-6 sm:space-y-12">
          <div className="space-y-3 sm:space-y-4">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant flex items-center gap-3 ml-1 opacity-60">
              Description
              <div className="h-px flex-1 bg-primary/10" />
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a detailed description for this task..."
              className="input-aurora w-full h-48 sm:h-64 resize-none p-4 sm:p-8 text-sm sm:text-base font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant opacity-60 ml-1">Due Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors sm:w-[18px] sm:h-[18px]" size={16} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-aurora pl-12 sm:pl-14 w-full py-3 sm:py-4 text-xs sm:text-sm font-bold appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant opacity-60 ml-1">Time</label>
              <div className="relative group">
                <Clock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors sm:w-[18px] sm:h-[18px]" size={16} />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="input-aurora pl-12 sm:pl-14 w-full py-3 sm:py-4 text-xs sm:text-sm font-bold appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-4">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant opacity-60 ml-1">Priority Level</label>
              <div className="relative">
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="input-aurora w-full py-3 px-6 sm:py-4 sm:px-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                >
                    <option value="low" className="bg-background">Low Priority</option>
                    <option value="medium" className="bg-background">Medium Priority</option>
                    <option value="high" className="bg-background">High Priority</option>
                </select>
                <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
                    <Flag size={12} className="sm:w-[14px] sm:h-[14px]" />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isOverdue && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] glass border border-red-500/20 bg-red-500/5 flex items-center gap-4 sm:gap-6 text-red-500 shadow-2xl shadow-red-500/5"
              >
                <AlertCircle className="shrink-0 sm:w-[32px] sm:h-[32px]" size={24} strokeWidth={2.5} />
                <div className="space-y-1 sm:space-y-1.5">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Task Overdue</h4>
                  <p className="text-[9px] sm:text-[10px] font-bold opacity-70 leading-relaxed uppercase tracking-widest">This task is past its due date and needs to be completed.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-8">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-text-variant opacity-60 ml-1">Task Preview</label>
            <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-primary/5 shadow-2xl transition-colors duration-500 relative overflow-hidden group">
              {/* Background accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 blur-[50px] sm:blur-[60px] opacity-20 transition-all duration-700 ${
                priority === 'high' ? "bg-red-500" :
                priority === 'medium' ? "bg-secondary" :
                "bg-emerald-500"
              }`} />

              <div className="absolute top-0 right-0 p-6 sm:p-10">
                <Flag size={16} className={`sm:w-[20px] sm:h-[20px] transition-colors duration-500 ${
                    priority === 'high' ? "text-red-500 animate-pulse" :
                    priority === 'medium' ? "text-secondary" :
                    "text-emerald-500"
                }`} strokeWidth={3} />
              </div>

              <div className="space-y-6 sm:space-y-8 relative z-10">
                <div className="flex items-center gap-4 sm:gap-5 pointer-events-none pr-6">
                  <h3 className={`text-xl sm:text-2xl font-black text-text tracking-tighter leading-tight ${completed ? "line-through opacity-40 grayscale" : ""}`}>
                    {title || "Untitled Task"}
                  </h3>
                </div>

                <p className="text-xs font-medium text-text-variant leading-relaxed opacity-60 line-clamp-6">
                  {description || "No description provided."}
                </p>

                <div className="pt-6 sm:pt-8 border-t border-primary/5 space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    <div className={`flex items-center text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isOverdue ? "text-red-500" : "text-text-variant opacity-80"} flex-wrap gap-1`}>
                      <Clock size={10} className="mr-1.5 text-primary sm:w-[12px] sm:h-[12px]" strokeWidth={3} />
                      {dueTime || "00:00"}
                      <span className="mx-2 opacity-20">|</span>
                      {dueDate ? format(new Date(dueDate), "MMM dd, yyyy") : "No Date"}
                    </div>
                  </div>
                  
                  <div className={`inline-flex px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${
                    priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10" :
                    priority === 'medium' ? "bg-secondary/10 text-secondary border-secondary/20 shadow-secondary/10" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10"
                  }`}>
                    {priority} Priority
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setCompleted(!completed)}
              className={`w-full flex items-center justify-center gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 border ${
                completed 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shadow-emerald-500/10" 
                  : "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-primary/20 hover:scale-[1.02]"
              }`}
            >
              {completed ? <RotateCw size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" /> : <Check size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" />}
              <span>{completed ? "Reactivate Task" : "Mark as Finished"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
