// Render the Tasks listing workspace, allowing users to organize todo items, toggle completion states, and filter tasks by due date or urgency levels.

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, updateTask, deleteTask, Task } from "../hooks/useTasks";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

// Filter headers displayed on the task management control bar.
const FILTERS = ["All", "Today", "Upcoming", "Completed"];

const Tasks = () => {
  // Track checklist arrays, filter configurations, and page router navigation.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load user tasks from DB storage using the active profile user ID.
  const loadTasks = useCallback(() => {
    if (user) getTasks(user.id).then(setTasks);
  }, [user]);

  // Sync the loaded task checklists when the authenticated user session changes.
  useEffect(() => { loadTasks(); }, [user, loadTasks]);

  // Toggle task completion flag in database storage and show success notifications.
  const handleToggle = async (id: string, completed: boolean | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await updateTask(id, { completed: !completed });
    toast.success(!completed ? "Task completed" : "Task reactivated");
    loadTasks();
  };

  // Remove a task checklist record permanently from the database.
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await deleteTask(id);
    toast.success("Task deleted");
    loadTasks();
  };

  // Filter task checklist items based on due dates, deadlines, and current dates.
  const today = new Date().toDateString();
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (activeFilter === "Completed") return !!t.completed;
      if (activeFilter === "Today") return t.due_date && new Date(t.due_date).toDateString() === today && !t.completed;
      if (activeFilter === "Upcoming") return t.due_date && new Date(t.due_date).toDateString() !== today && !t.completed;
      return true;
    });
  }, [tasks, activeFilter, today]);

  // Group active tasks into sub-lists depending on priority parameters.
  const highPriority = filtered.filter((t) => t.priority === "high" && !t.completed);
  const activeFlow   = filtered.filter((t) => t.priority !== "high" && !t.completed);
  const achieved     = filtered.filter((t) => !!t.completed);

  // Setup motion properties to stagger entry animations of the task rows.
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const rowVariant = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } };

  const TaskRow = ({ task }: { task: Task }) => {
    const done = !!task.completed;
    return (
      <motion.div
        variants={rowVariant}
        onClick={() => navigate(`/tasks/${task.id}`)}
        className="group grid cursor-pointer grid-cols-[24px_minmax(0,1fr)_auto_36px] items-center gap-3.5 rounded-[18px] px-2 py-3.5 hover:bg-water sm:grid-cols-[24px_minmax(0,1fr)_90px_90px_36px]"
      >
        {/* Round checkbox */}
        <button
          onClick={(e) => handleToggle(task.id, task.completed, e)}
          className={`lm-check ${done ? "done" : ""}`}
          aria-label={`${done ? "Reopen" : "Complete"} ${task.title}`}
        />

        {/* Content */}
        <div className="min-w-0">
          <span className={`block truncate font-semibold ${done ? "lm-strike" : ""}`}>{task.title}</span>
          <span className="lm-muted block truncate">{task.description || (task.due_date ? "" : "No deadline")}</span>
        </div>

        {/* Priority chip */}
        <span className="justify-self-start">
          {task.priority && !done && (
            <span className={`lm-chip ${task.priority === "high" ? "lm-chip-h" : ""}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
        </span>

        {/* Due date */}
        <span className="lm-muted hidden sm:block">
          {task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>

        {/* Delete */}
        <button
          onClick={(e) => handleDelete(task.id, e)}
          className="grid h-8 w-8 place-items-center rounded-full text-ink2 opacity-100 transition hover:bg-alert/10 hover:text-alert sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 size={16} />
        </button>
      </motion.div>
    );
  };

  interface GroupProps { color: string; label: string; list: Task[]; }
  const Group = ({ color, label, list }: GroupProps) => (
    <AnimatePresence mode="popLayout">
      {list.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="mb-4"
        >
          <h3 className="mb-1 mt-3 flex items-center gap-2.5 px-2 text-sm font-bold text-ink2">
            <span className="lm-dot !h-2.5 !w-2.5" style={{ background: color }} />
            {label}
          </h3>
          <motion.div variants={stagger} initial="hidden" animate="show">
            {list.map((t) => <TaskRow key={t.id} task={t} />)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const openCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="sec-tasks">
      <section className="lm-lobe">
        <h1>Tasks</h1>
        <p>{openCount} open · {highPriority.length} high priority.</p>
        <div className="lm-acts">
          <button onClick={() => navigate("/tasks/new")} className="lm-btn">
            <Plus size={16} strokeWidth={3} /> New task
          </button>
          <Link to="/chat" className="lm-btn lm-btn-ghost">Ask Aura to plan them</Link>
        </div>
      </section>

      <div className="lm-lift lm-sheet">
        {/* Filter tabs */}
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <div className="lm-seg" role="group" aria-label="Filter">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} aria-pressed={activeFilter === f}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task groups */}
        {tasks.length === 0 ? (
          <EmptyState
            icon={<Plus size={28} />}
            title="No tasks yet"
            description="Create your first task to start organizing your daily goals."
            actionLink="/tasks/new"
            actionLabel="+ Create new task"
          />
        ) : filtered.length === 0 ? (
          <p className="px-2 py-10 text-[19px]">Nothing here. Try another filter, or tell Aura “add a task…”.</p>
        ) : (
          <div>
            <Group color="rgb(var(--alert))" label="High priority" list={highPriority} />
            <Group color="rgb(var(--tasks))" label="In progress" list={activeFlow} />
            <Group color="rgb(var(--today))" label="Completed" list={achieved} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
