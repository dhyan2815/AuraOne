import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  PlusIcon,
  Clock,
  FilterIcon,
  CheckCheck,
  Search,
  GridIcon,
  ListIcon,
  Sparkles
} from "lucide-react";
import TaskCard from "../components/tasks/TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenToTasks,
  updateTask,
  getTasks,
  Task,
} from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";
import { RealtimeChannel } from "@supabase/supabase-js";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedTasks = await getTasks(user.id);
      setTasks(fetchedTasks);
    } catch (error) {
      toast.error("Protocol sync interrupted");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchTasks();
    const channel: RealtimeChannel = listenToTasks(user.id, () => {
      fetchTasks();
    });
    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchTasks]);

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.completed;
    try {
      await updateTask(taskId, { completed: newStatus });
      toast.success(newStatus ? "Objective secured" : "Registry updated");
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
    } catch (error) {
      toast.error("State transition failed");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    let statusFiltered = true;
    if (filter === "completed") statusFiltered = task.completed === true;
    if (filter === "pending") statusFiltered = task.completed === false;
    let searchFiltered = true;
    if (searchQuery) {
      searchFiltered =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        !!(task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return statusFiltered && searchFiltered;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} className="aurora-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operations Center</span>
          </div>
          <h1 className="display-lg leading-tight text-aurora-on-surface">Task Registry</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input
              type="text"
              placeholder="Search registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-aurora pl-12 w-full py-3"
            />
          </div>

          <div className="flex items-center glass p-1 rounded-2xl border border-primary/5 shadow-sm">
            <button
              className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-aurora-on-surface-variant hover:text-primary"}`}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon size={18} />
            </button>
            <button
              className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-aurora-on-surface-variant hover:text-primary"}`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon size={18} />
            </button>
          </div>

          <Link to="/tasks/new" className="btn-aurora-primary px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]">
            <PlusIcon size={16} />
            New Command
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        {[
          { id: 'all', label: 'All Protocols', icon: FilterIcon, color: 'primary' },
          { id: 'pending', label: 'Active', icon: Clock, color: 'secondary' },
          { id: 'completed', label: 'Secured', icon: CheckCheck, color: 'success' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
              filter === item.id 
                ? `bg-${item.color}/10 border-${item.color}/20 text-${item.color} shadow-sm` 
                : "glass border-transparent text-aurora-on-surface-variant hover:border-primary/20 hover:text-aurora-on-surface"
            }`}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {sortedTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-[3rem] border-dashed border-primary/10"
          >
            <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mb-6 shadow-sm text-primary/30">
              <Sparkles size={40} />
            </div>
            <h3 className="text-xl font-black text-aurora-on-surface mb-2 italic tracking-tight">System Registry Empty</h3>
            <p className="text-xs font-bold text-aurora-on-surface-variant max-w-xs mb-8 uppercase tracking-widest">
              No objectives found in this sector.
            </p>
            <Link to="/tasks/new" className="btn-aurora-secondary px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em]">
              Initialize New Objective
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layout
            className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4 max-w-5xl mx-auto"}
          >
            {sortedTasks.map((task: Task, idx) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                layout
              >
                <TaskCard task={task} viewMode={viewMode} onToggleComplete={handleToggleComplete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;

