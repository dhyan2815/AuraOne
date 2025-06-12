// pages/Tasks.tsx
import { useState, useEffect } from "react";
import {
  PlusIcon,
  Calendar,
  Clock,
  FilterIcon,
  CheckCheck,
} from "lucide-react";
import TaskItem from "../components/tasks/TaskItem";
import { motion } from "framer-motion";
import {
  getTasks,
  addTask as addTaskToDB,
  updateTask as updateTaskInDB,
  deleteTask as deleteTaskFromDB,
  Task,
} from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";

const Tasks = () => {
  // State for managing tasks, new task input, editing state, filter, description, due date, due time, priority, and completion status
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState("");
  const [completed, setCompleted] = useState<"completed" | "due">("due");

  const { user } = useAuth();

  // Fetch tasks from the database when the component mounts or when the user changes
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
      const fetchedTasks = await getTasks(user.uid);
      setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();
  }, [user]);

  // Function to handle adding a new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    const task: Omit<Task, "id"> = {
      title: newTask,
      description: description,
      dueDate: dueDate,
      dueTime: dueTime,
      completed: completed,
      priority: priority,
    };

    try {
      await addTaskToDB(user.uid, task);
    const updatedTasks = await getTasks(user.uid);
    setTasks(updatedTasks);
      setNewTask("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setPriority("");
      setCompleted("due");
    } catch (error) {
      console.error("Error adding task:", error);
  }
  };

  // Function to handle editing a task
  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setNewTask(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDueDate(taskToEdit.dueDate || "");
      setDueTime(taskToEdit.dueTime || "");
      setPriority(taskToEdit.priority || "");
      setCompleted(taskToEdit.completed);
    }
  };

  // Function to handle updating a task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user || !editingTaskId) return;

    const task: Omit<Task, "id"> = {
      title: newTask,
      description: description,
      dueDate: dueDate,
      dueTime: dueTime,
      completed: completed,
      priority: priority,
  };

    try {
      await updateTaskInDB(user.uid, editingTaskId, task);
      const updatedTasks = await getTasks(user.uid);
      setTasks(updatedTasks);
      setNewTask("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setPriority("");
      setCompleted("due");
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
};

  // Function to handle deleting a task
  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteTaskFromDB(user.uid, id);
      const updatedTasks = await getTasks(user.uid);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Function to handle toggling the completion status of a task
  const handleToggleComplete = async (id: string, completed: string) => {
    if (!user) return;
    const newStatus = completed === "completed" ? "due" : "completed";
    try {
      await updateTaskInDB(user.uid, id, { completed: newStatus });
      const updatedTasks = await getTasks(user.uid);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed === "completed";
    if (filter === "pending") return task.completed === "due";
    return true;
  });

  // Framer Motion variants for animating the task list
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-3xl font-semibold">Tasks</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your tasks and stay organized
        </p>
      </div>

      {/* Task input form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-2 mb-4">
        <form onSubmit={editingTaskId ? handleUpdateTask : handleAddTask} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="input flex-1"
            />
          </div>
          <div className="flex gap-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description..."
              className="input  flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="dueDate" className="text-sm">Due Date:</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="dueTime" className="text-sm">Due Time:</label>
              <input
                type="time"
                id="dueTime"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="input text-sm"
              />
            </div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input text-sm"
            >
              <option value="" disabled>Select priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={completed}
              onChange={(e) => setCompleted(e.target.value as "completed" | "due")}
              className="input text-sm"
            >
              <option value="due">No</option>
              <option value="completed">Yes</option>
            </select>
            <button type="submit" className="button-primary text-sm">
              {editingTaskId ? (
                <>Update Task</>
              ) : (
                <>
                  <PlusIcon size={18} className="mr-1" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Task filter buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === "all"
              ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}
          onClick={() => setFilter("all")}
        >
          <FilterIcon size={16} />
          All
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === "pending"
              ? "bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}
          onClick={() => setFilter("pending")}
        >
          <Clock size={16} />
          Pending
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === "completed"
              ? "bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}
          onClick={() => setFilter("completed")}
        >
          <CheckCheck size={16} />
          Completed
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          <Calendar size={16} />
          Due date
        </button>
      </div>

      {/* Conditional rendering for empty task list */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            {filter === "all"
              ? "No tasks found"
              : filter === "completed"
                ? "No completed tasks yet"
                : "No pending tasks"}
          </p>
          {filter !== "all" && (
            <button
              className="text-primary-600 hover:text-primary-700"
              onClick={() => setFilter("all")}
            >
              View all tasks
            </button>
          )}
        </div>
      ) : (
        // Render the task list using Framer Motion for animations
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filteredTasks.map((task) => (
            <motion.div key={task.id} variants={item}>
              <TaskItem
                task={task}
                onToggleComplete={() =>
                  handleToggleComplete(task.id, task.completed)
                }
                onEdit={() => handleEditTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;