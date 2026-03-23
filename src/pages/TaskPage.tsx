import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  Trash2,
  CheckCircle,
  Flag,
  Sparkles,
  RotateCw,
  AlertCircle
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
          setTitle("Initialize Protocol");
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
            toast.error("Protocol not found");
            navigate("/tasks");
          }
        }
      } catch (err) {
        toast.error("Neural link sync failed");
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
      title: title.trim() || "Initialize Protocol",
      description: description.trim(),
      due_date: finalDueDate,
      priority,
      completed,
    };

    try {
      setIsSaving(true);
      if (id === "new") {
        await createTask(user.id, taskData);
        toast.success("Objective initialized");
      } else if (id) {
        await updateTask(id, taskData);
        toast.success("Protocol updated");
      }
      navigate("/tasks");
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id || id === "new") {
      navigate("/tasks");
      return;
    }
    if (!window.confirm("Purge this objective from the registry?")) return;
    try {
      await deleteTask(id);
      toast.success("Objective neutralized");
      navigate("/tasks");
    } catch (error) {
      toast.error("Purge sequence failed");
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
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4">
          <RotateCw className="text-primary animate-spin" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Accessing Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-6 group">
          <button
            onClick={() => navigate("/tasks")}
            className="mt-1 p-3 rounded-2xl glass border border-primary/5 text-aurora-on-surface-variant hover:text-primary hover:border-primary/20 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={14} className="aurora-glow" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Command</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl md:text-5xl font-black bg-transparent border-0 outline-none w-full text-aurora-on-surface placeholder:text-aurora-on-surface-variant/20 tracking-tight leading-none"
              placeholder="Initialize Protocol"
            />
            {createdAt && (
              <div className="flex items-center text-[10px] font-bold text-aurora-on-surface-variant uppercase tracking-widest opacity-60">
                <Calendar size={12} className="mr-2" />
                Initialized on {format(new Date(createdAt), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 lg:self-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-aurora-primary px-8 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
            Secure Objective
          </button>

          <button
            onClick={handleDelete}
            className="p-3 rounded-2xl glass border border-primary/5 text-aurora-on-surface-variant hover:text-error hover:border-error/20 transition-all active:scale-95"
            aria-label="Purge objective"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface-variant flex items-center gap-2">
              Objective Context
              <div className="h-[1px] flex-1 bg-primary/5" />
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational details awaiting input..."
              className="input-aurora w-full h-48 resize-none p-6 text-sm font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface-variant">Target Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-aurora pl-12 w-full py-3 text-sm font-bold appearance-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface-variant">Target Time</label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="input-aurora pl-12 w-full py-3 text-sm font-bold appearance-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface-variant">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="input-aurora w-full py-3 px-6 text-sm font-black uppercase tracking-widest appearance-none cursor-pointer"
              >
                <option value="low" className="bg-white">Tier III (Low)</option>
                <option value="medium" className="bg-white">Tier II (Medium)</option>
                <option value="high" className="bg-white">Tier I (High)</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {isOverdue && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-[2rem] glass border border-error/20 bg-error/5 flex items-center gap-4 text-error"
              >
                <AlertCircle className="aurora-glow" size={24} />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest">Temporal Infraction Detected</h4>
                  <p className="text-[10px] font-bold opacity-70">The designated deadline has elapsed. Immediate intervention required.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div className="space-y-6 sticky top-8">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface-variant">Registry Preview</label>
            <div className="glass-panel p-8 rounded-[3rem] border border-primary/5 shadow-xl shadow-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                {priority === 'high' && <Flag size={20} className="text-error" />}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 pointer-events-none">
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${completed ? "bg-primary border-primary text-white" : "border-primary/20 text-transparent"}`}>
                    <CheckCircle size={18} />
                  </div>
                  <h3 className={`text-xl font-black text-aurora-on-surface leading-tight ${completed ? "line-through opacity-40" : ""}`}>
                    {title || "Initialize Protocol"}
                  </h3>
                </div>

                <p className="text-xs font-medium text-aurora-on-surface-variant leading-relaxed opacity-60 line-clamp-4">
                  {description || "No operational details specified for this objective sector."}
                </p>

                <div className="pt-6 border-t border-primary/5 space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${isOverdue ? "text-error" : "text-aurora-on-surface-variant"}`}>
                      <Clock size={12} className="mr-2" />
                      {dueTime || "00:00"}
                      <span className="mx-2 opacity-20">|</span>
                      {dueDate ? format(new Date(dueDate), "MMM d, yyyy") : "STND_TIME"}
                    </div>
                  </div>
                  
                  <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                    priority === 'high' ? "bg-error/10 text-error border-error/20" :
                    priority === 'medium' ? "bg-secondary/10 text-secondary border-secondary/20" :
                    "bg-success/10 text-success border-success/20"
                  }`}>
                    {priority} Priority
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setCompleted(!completed)}
              className={`w-full py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${
                completed 
                  ? "bg-success/10 border-success/20 text-success" 
                  : "glass border-primary/10 text-aurora-on-surface-variant hover:text-primary hover:border-primary/20"
              }`}
            >
              {completed ? "Objective Secured" : "Secure Objective"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;