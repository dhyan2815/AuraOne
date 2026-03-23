import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, updateTask, deleteTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import { CheckCircle, Clock, Trash2, LayoutList } from "lucide-react";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

const TasksWidget = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const fetchTasks = async () => {
                try {
                    const fetched = await getTasks(user.id);
                    setTasks(fetched);
                } catch (error) {
                    console.error("Failed to fetch tasks:", error);
                }
            };
            fetchTasks();
        }
    }, [user]);

    const handleToggleComplete = async (id: string, currentCompleted: boolean | undefined) => {
        if (!user) return;
        const newStatus = !currentCompleted;
        try {
            await updateTask(id, { completed: newStatus });
            toast.success(newStatus ? "Task completed!" : "Task active!");
            const updated = await getTasks(user.id);
            setTasks(updated);
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleDeleteTask = async (id: string, title: string) => {
        if (!user || !window.confirm(`Delete "${title}"?`)) return;
        try {
            await deleteTask(id);
            toast.success("Task removed");
            const updated = await getTasks(user.id);
            setTasks(updated);
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return dateString; }
    };

    const displayTasks = tasks
        .filter((task) => !task.completed)
        .sort((a, b) => {
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        })
        .slice(0, 4);

    return (
        <div className="h-full flex flex-col">
            <AnimatePresence mode="popLayout">
                {displayTasks.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-4"
                    >
                        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                            <LayoutList className="text-primary/40" />
                        </div>
                        <p className="text-sm font-black text-aurora-on-surface">Nothing pending</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-aurora-on-surface-variant mt-1">Peace of mind achieved</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {displayTasks.map((task, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={task.id}
                                className="group flex items-center gap-3 p-3 glass rounded-2xl hover:bg-white/50 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleComplete(task.id, task.completed);
                                    }}
                                    className="p-1.5 rounded-xl glass hover:bg-white transition-colors"
                                >
                                    <CheckCircle size={14} className="text-aurora-on-surface-variant group-hover:text-primary transition-colors" />
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-black truncate text-aurora-on-surface">{task.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg glass-panel ${
                                            task.priority === 'high' ? 'text-error' : task.priority === 'medium' ? 'text-secondary' : 'text-aurora-on-surface-variant'
                                        }`}>
                                            {task.priority || 'low'}
                                        </span>
                                        {task.due_date && (
                                            <div className="flex items-center text-[10px] font-bold text-aurora-on-surface-variant">
                                                <Clock size={10} className="mr-1" />
                                                {formatTime(task.due_date)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id, task.title);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-error/10 text-aurora-on-surface-variant hover:text-error transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TasksWidget;
