import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, updateTask, deleteTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import { CheckCircle, Clock, Trash2, LayoutList } from "lucide-react";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

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
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 4);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Upcoming Tasks</span>
                    <LayoutList className="w-5 h-5 text-slate-400" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <AnimatePresence mode="popLayout">
                    {displayTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-center p-4"
                        >
                            <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                                <LayoutList className="text-primary/40" />
                            </div>
                            <p className="text-sm font-bold text-text">Nothing pending</p>
                            <p className="text-xs text-slate-500 mt-1">Peace of mind achieved</p>
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
                                    className="group flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all cursor-pointer border border-slate-200 dark:border-gray-700"
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleComplete(task.id, task.completed);
                                        }}
                                        className="p-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <CheckCircle size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-text">{task.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-opacity-20 ${
                                                task.priority === 'high' ? 'bg-red-500 text-red-700 dark:text-red-400'
                                                : task.priority === 'medium' ? 'bg-yellow-500 text-yellow-700 dark:text-yellow-400'
                                                : 'bg-slate-300 text-slate-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                                {task.priority || 'low'}
                                            </span>
                                            {task.due_date && (
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <Clock size={12} className="mr-1" />
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
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default TasksWidget;
