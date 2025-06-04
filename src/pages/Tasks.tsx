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
  Task,
} from "../hooks/useTasks";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  // Fetch data from the firestore
  useEffect(() => {
    const fetchData = async () => {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    };
    fetchData();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Omit<Task, "id"> = {
      title: newTask,
      description: "",
      dueDate: "",
      completed: false,
      priority: "medium",
    };

    await addTaskToDB(task);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    setNewTask("");
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await updateTaskInDB(id, { completed });
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

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
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Tasks</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your tasks and stay organized
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="input flex-1"
          />
          <button type="submit" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            Add
          </button>
        </form>
      </div>

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
                  handleToggleComplete(task.id, !task.completed)
                }
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;
