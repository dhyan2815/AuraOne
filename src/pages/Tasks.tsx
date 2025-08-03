// pages/Tasks.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  Clock,
  FilterIcon,
  CheckCheck,
  Search,
  GridIcon,
  ListIcon,
} from "lucide-react";
import TaskCard from "../components/tasks/TaskCard";
import { motion } from "framer-motion";
import {
  listenToTasks,
  Task,
} from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToTasks(user.uid, (fetchedTasks) => {
      setTasks(fetchedTasks as Task[]);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredTasks = tasks.filter((task) => {
    // First apply status filter
    let statusFiltered = true;
    if (filter === "completed") statusFiltered = task.completed === "completed";
    if (filter === "pending") statusFiltered = task.completed === "due";
    
    // Then apply search filter
    let searchFiltered = true;
    if (searchQuery) {
      searchFiltered = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.priority.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return statusFiltered && searchFiltered;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Tasks</h1>

        <div className="flex items-center gap-5">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute flex-1 left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="  Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-1">
            <button
              className={`p-1.5 rounded ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon size={18} />
            </button>
            <button
              className={`p-1.5 rounded ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon size={18} />
            </button>
          </div>

          <Link to="/tasks/new" className="button-primary">
            <PlusIcon size={18} className="mr-1" />
            New Task
          </Link>
        </div>
      </div>

      {/* Task filter buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${filter === "all"
              ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          onClick={() => setFilter("all")}
        >
          <FilterIcon size={16} />
          All
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${filter === "pending"
              ? "bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          onClick={() => setFilter("pending")}
        >
          <Clock size={16} />
          Pending
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${filter === "completed"
              ? "bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-100"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          onClick={() => setFilter("completed")}
        >
          <CheckCheck size={16} />
          Completed
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
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
          {filter === "all" && (
            <Link to="/tasks/new" className="button-primary">
              <PlusIcon size={18} className="mr-1" />
              Create your first task
            </Link>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {filteredTasks.map((task: Task) => (
            <motion.div key={task.id} variants={item}>
              <TaskCard task={task} viewMode={viewMode} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;
