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
  const [completed, setCompleted] = useState<"completed" | "due">("due");
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
          setCompleted(newTask.completed);
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
            setCompleted(typedTask.completed);
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
      completed,
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

  const toggleCompleted = () => {
    setCompleted(completed === "completed" ? "due" : "completed");
  };

  const isOverdue = task?.dueDate && task.dueTime && (() => {
    try {
      const [time, ampm] = task.dueTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      const dueDateTime = new Date(`${task.dueDate}T${hour.toString().padStart(2, '0')}:${minutes}:00`);
      return dueDateTime < new Date() && completed === "due";
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
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-3xl font-semibold bg-transparent border-0 outline-none w-full"
                placeholder="Task title"
              />
              <button
                onClick={toggleCompleted}
                className={`p-2 rounded-full ${
                  completed === "completed"
                    ? "text-success-500"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <CheckCircle size={20} fill={completed === "completed" ? "currentColor" : "none"} />
              </button>
            </div>
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

        {/* Due Date, Time, and Priority */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Due Date & Time
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Calendar size={16} className="text-slate-500" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Clock size={16} className="text-slate-500" />
              <select
                value={dueTime.split(':')[0] || '12'}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = dueTime.split(':')[1] || '00';
                  const ampm = dueTime.includes('PM') ? 'PM' : 'AM';
                  setDueTime(`${hour}:${minute} ${ampm}`);
                }}
                className="input w-20"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num.toString().padStart(2, '0')}>
                    {num}
                  </option>
                ))}
              </select>
              <span className="text-slate-500">:</span>
              <select
                value={dueTime.split(':')[1]?.split(' ')[0] || '00'}
                onChange={(e) => {
                  const hour = dueTime.split(':')[0] || '12';
                  const minute = e.target.value;
                  const ampm = dueTime.includes('PM') ? 'PM' : 'AM';
                  setDueTime(`${hour}:${minute} ${ampm}`);
                }}
                className="input w-20"
              >
                {Array.from({ length: 60 }, (_, i) => i).map(num => (
                  <option key={num} value={num.toString().padStart(2, '0')}>
                    {num.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                value={dueTime.includes('PM') ? 'PM' : 'AM'}
                onChange={(e) => {
                  const timeParts = dueTime.split(' ');
                  const time = timeParts[0] || '12:00';
                  setDueTime(`${time} ${e.target.value}`);
                }}
                className="input w-16"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div>
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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Status
          </label>
          <div className="flex items-center gap-2">
            <select
              value={completed}
              onChange={(e) => setCompleted(e.target.value as "completed" | "due")}
              className="input"
            >
              <option value="due">Due</option>
              <option value="completed">Completed</option>
            </select>
            {isOverdue && (
              <div className="flex items-center text-error-600 dark:text-error-400">
                <Flag size={16} className="mr-1" />
                <span className="text-sm font-medium">Overdue</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task preview */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Task Preview</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle 
              size={16} 
              className={completed === "completed" ? "text-success-500" : "text-slate-400"} 
            />
            <span className={`font-medium ${
              completed === "completed" ? "line-through text-slate-500" : ""
            }`}>
              {title || "Untitled Task"}
            </span>
          </div>
          {description && (
            <p className={`text-sm text-slate-600 dark:text-slate-400 ${
              completed === "completed" ? "line-through" : ""
            }`}>
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