import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  Trash2,
  Star,
  Pin,
  CheckCircle,
  Flag,
} from "lucide-react";
import { format } from "date-fns";
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  dueTime?: string;
  completed: "completed" | "due";
  priority: "low" | "medium" | "high";
  createdAt?: string;
  pinned?: boolean;
  starred?: boolean;
}

const TaskPage = () => {
  const [task, setTask] = useState<Task | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const [starred, setStarred] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchTask = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (id === "new") {
                     const newTask: Task = {
             id: "new",
             title: "Untitled Task",
             description: "",
             dueDate: "",
             dueTime: "",
             priority: "medium",
             completed: "due",
             createdAt: new Date().toISOString(),
             pinned: false,
             starred: false,
           };
           setTask(newTask);
           setTitle(newTask.title);
           setDescription(newTask.description);
           setDueDate(newTask.dueDate || "");
           setDueTime(newTask.dueTime || "");
           setPriority(newTask.priority);
           setPinned(false);
           setStarred(false);
                   } else if (id) {
             const foundTask = await getTaskById(user.uid, id);
             if (foundTask) {
               const typedTask = foundTask as Task;
               setTask(typedTask);
               setTitle(typedTask.title);
               setDescription(typedTask.description);
               setDueDate(typedTask.dueDate || "");
               setDueTime(typedTask.dueTime || "");
               setPriority(typedTask.priority);
               setPinned(typedTask.pinned || false);
               setStarred(typedTask.starred || false);
             } else {
               navigate("/tasks");
             }
           }
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!user) return;

    const taskData = {
      title: title.trim() || "Untitled Task",
      description: description.trim(),
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      completed: "due" as const,
      pinned,
      starred,
    };

    try {
      if (task?.id === "new" || !task?.id) {
        const newTaskData = {
          ...taskData,
          createdAt: new Date().toISOString(),
        };
        const newId = await createTask(user.uid, newTaskData);
        toast.success("New Task created Successfully");
        navigate(`/tasks/${newId}`, { replace: true });
      } else {
        await updateTask(user.uid, task.id, taskData);
        navigate("/tasks");
        toast.success("Task Updated successfully");
      }
    } catch (err) {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async () => {
    if (!user || !task?.id || task.id === "new") {
      navigate("/tasks");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this Task?")) return;

    try {
      await deleteTask(user.uid, task.id);
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } catch (error) {
      toast.error("Deletion of task failed");
    }
  };

  const toggleStarred = () => {
    setStarred(!starred);
  };

  const togglePinned = () => {
    setPinned(!pinned);
  };

  const isOverdue = task?.dueDate && task.dueTime && (() => {
    try {
      // HTML time input provides 24-hour format (HH:MM)
      const [hours, minutes] = task.dueTime.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      if (hour !== undefined && minute !== undefined) {
        const dueDateTime = new Date(`${task.dueDate}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        return dueDateTime < new Date();
      }
      
      return false;
    } catch {
      return false;
    }
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading task...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Title and date */}
        <div className="flex items-center">
          <button
            onClick={() => navigate("/tasks")}
            className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold bg-transparent border-0 outline-none w-full"
              placeholder="Task title"
            />
            {task?.createdAt && (
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                <Calendar size={14} className="mr-1" />
                {format(new Date(task.createdAt), "MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleStarred}
            className={`p-2 rounded-full ${
              starred
                ? "text-warning-500"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Star size={20} fill={starred ? "currentColor" : "none"} />
          </button>

          <button
            onClick={togglePinned}
            className={`p-2 rounded-full ${
              pinned
                ? "text-primary-500"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Pin size={20} />
          </button>

          <button onClick={handleSave} className="button-primary">
            <Save size={18} className="mr-1" />
            Save
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-slate-400 hover:text-error-600 dark:hover:text-error-400"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Task details section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add task description..."
            className="input w-full h-32 resize-none"
          />
        </div>

        {/* Due Date, Time, and Priority - All on same line */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-6">
            {/* Due Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Due Date
              </label>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input flex-1"
                />
              </div>
            </div>
            
                         {/* Due Time */}
             <div className="flex-1">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                 Due Time
               </label>
               <div className="flex items-center gap-2">
                 <Clock size={16} className="text-slate-500" />
                 <input
                   type="time"
                   value={dueTime}
                   onChange={(e) => setDueTime(e.target.value)}
                   className="input flex-1"
                 />
               </div>
             </div>

            {/* Priority */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          {isOverdue && (
            <div className="flex items-center text-error-600 dark:text-error-400 mt-2">
              <Flag size={16} className="mr-1" />
              <span className="text-sm font-medium">Task is overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Task preview */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Task Preview</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle 
              size={16} 
              className="text-slate-400" 
            />
            <span className="font-medium">
              {title || "Untitled Task"}
            </span>
          </div>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {dueDate && (
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {format(new Date(dueDate), 'MMM d, yyyy')}
              </div>
            )}
            {dueTime && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                {dueTime}
              </div>
            )}
            <div className={`px-2 py-0.5 rounded-full text-xs ${
              priority === 'low' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
              priority === 'medium' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300' :
              'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300'
            }`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage; 