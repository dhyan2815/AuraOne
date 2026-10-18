// Render the task creation and editor form, managing priorities, due dates, completion toggles, and overdue flags.

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Trash2,
  RotateCw,
  AlertCircle,
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
import { ConfirmDialog } from "../components/ui/Dialog";

const TaskPage = () => {
  // Access dynamic routing context parameters and user authentication values.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Track task property fields (title, priority level, due dates, description details).
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch the selected task checklist fields from database storage or initialize default values.
  useEffect(() => {
    const fetchTask = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (id === "new") {
          setTitle("New Task");
          setDescription("");
          setDueDate("");
          setDueTime("");
          setPriority("medium");
          setCompleted(false);
          return setCreatedAt(new Date().toISOString());
        }

        if (!id) return;

        const foundTask = await getTaskById(id);
        if (!foundTask) {
          toast.error("Objective not found");
          return navigate("/tasks");
        }

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
      } catch {
        toast.error("Uplink failed");
        navigate("/tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, user, navigate]);

  // Dispatch task modifications to Supabase database tables (inserts for new tasks, updates for existing tasks).
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
      title: title.trim() || "Untitled Protocol",
      description: description.trim(),
      due_date: finalDueDate,
      priority,
      completed,
    };

    try {
      setIsSaving(true);
      if (id === "new") {
        await createTask(user.id, taskData);
        toast.success("Task Saved");
        return navigate("/tasks");
      }

      if (!id) return;

      await updateTask(id, taskData);
      toast.success("Task Updated");
      navigate("/tasks");
    } catch {
      toast.error("Transmission interruption");
    } finally {
      setIsSaving(false);
    }
  };

  // Remove a task checklist record permanently and redirect the router back to the main list.
  const handleDelete = async () => {
    if (!user || !id || id === "new") {
      navigate("/tasks");
      return;
    }
    try {
      await deleteTask(id);
      toast.success("Task Deleted");
      navigate("/tasks");
    } catch {
      toast.error("Purge system error");
    }
  };

  // Check if the current date is past the task's configured due date and time.
  const isOverdue = useMemo(() => {
    if (!dueDate || completed) return false;
    try {
      const targetDate = dueTime ? new Date(`${dueDate}T${dueTime}`) : new Date(`${dueDate}T23:59:59`);
      return targetDate < new Date();
    } catch {
      return false;
    }
  }, [dueDate, dueTime, completed]);

  if (loading) {
    return (
      <div className="sec-tasks grid min-h-[60vh] place-items-center" role="status">
        <div className="text-center">
          <div className="lm-blob lm-pulse mx-auto mb-4 h-20 w-20" />
          <p className="lm-display text-3xl">Loading task…</p>
        </div>
      </div>
    );
  }

  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <div className="sec-tasks">
      <section className="lm-lobe">
        <button onClick={() => navigate("/tasks")} className="inline-flex items-center gap-1.5 font-semibold">
          <ArrowLeft size={16} /> All tasks
        </button>
        <h1 className="mt-3.5 break-words" style={{ fontSize: "clamp(40px, 5.6vw, 84px)" }}>
          {title || "Untitled task"}
        </h1>
        <div className="lm-acts">
          <span className={`lm-chip ${priority === "high" ? "lm-chip-h" : ""}`}>{priorityLabel}</span>
          {dueDate && (
            <span className="lm-chip !bg-white/60 !text-[#1F211E]">
              Due {format(new Date(`${dueDate}T00:00:00`), "MMM d")}{dueTime ? ` · ${dueTime}` : ""}
            </span>
          )}
          <span className="lm-chip !bg-white/60 !text-[#1F211E]">{completed ? "Done" : "Open"}</span>
          {createdAt && (
            <span className="lm-chip !bg-white/60 !text-[#1F211E]">
              Created {format(new Date(createdAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </section>

      <div className="lm-lift grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="lm-sheet">
          <h2 className="lm-sheet-title">Details</h2>
          <label className="lm-field mb-4">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="lm-input"
              placeholder="Enter task title…"
            />
          </label>
          <label className="lm-field">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a detailed description for this task…"
              className="lm-input min-h-[180px] !rounded-[20px] leading-relaxed"
            />
          </label>

          <AnimatePresence>
            {isOverdue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                role="alert"
                className="lm-error mt-5 flex items-center gap-3"
              >
                <AlertCircle className="shrink-0" size={22} />
                <span>This task is past its due date and needs to be completed.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => (id === "new" ? handleDelete() : setConfirmDelete(true))}
              className="lm-btn lm-btn-danger"
            >
              <Trash2 size={16} /> Delete task
            </button>
            <div className="flex gap-2">
              <button onClick={() => navigate("/tasks")} className="lm-btn lm-btn-soft">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="lm-btn">
                {isSaving ? <RotateCw className="animate-spin" size={16} strokeWidth={3} /> : <Save size={16} strokeWidth={3} />}
                Save changes
              </button>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">Settings</h2>
            <dl className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-4 gap-y-3.5">
              <dt className="font-semibold">Status</dt>
              <dd className="m-0">
                <div className="lm-seg" role="group" aria-label="Status">
                  <button type="button" aria-pressed={!completed} onClick={() => setCompleted(false)}>Open</button>
                  <button type="button" aria-pressed={completed} onClick={() => setCompleted(true)}>Done</button>
                </div>
              </dd>

              <dt className="font-semibold">Priority</dt>
              <dd className="m-0">
                <div className="lm-seg" role="group" aria-label="Priority">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button key={p} type="button" aria-pressed={priority === p} onClick={() => setPriority(p)}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </dd>

              <dt className="font-semibold">Due</dt>
              <dd className="m-0">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="lm-input"
                  aria-label="Due date"
                />
              </dd>

              <dt className="font-semibold">Time</dt>
              <dd className="m-0">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="lm-input"
                  aria-label="Due time"
                />
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this task?"
        body={`${title || "This task"} will be removed permanently.`}
        cancelLabel="Keep task"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TaskPage;
