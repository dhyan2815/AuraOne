// Tasks Mini-Widget — Renders a dashboard utility panel displaying a summary list of active and recently completed tasks.

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getTasks, updateTask, Task } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const TasksWidget = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getTasks(user.id)
        .then(setTasks)
        .catch(() => {});
    }
  }, [user]);

  const handleToggle = async (id: string, completed: boolean | undefined) => {
    if (!user) return;
    try {
      await updateTask(id, { completed: !completed });
      toast.success(!completed ? "Task Completed" : "Task Reactivated");
      const updated = await getTasks(user.id);
      setTasks(updated);
    } catch {
      toast.error("Operation failed");
    }
  };

  const incomplete = tasks.filter((t) => !t.completed).slice(0, 3);
  const completedTasks = tasks.filter((t) => t.completed).slice(0, 1);
  const display = [...incomplete, ...completedTasks].slice(0, 3);

  if (display.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 py-2">
        <p className="lm-display text-3xl">All caught up</p>
        <p className="lm-muted">You have no pending tasks.</p>
        <Link to="/tasks/new" className="lm-btn lm-btn-sm">Create task</Link>
      </div>
    );
  }

  return (
    <div>
      {display.map((task) => {
        const isCompleted = !!task.completed;
        return (
          <div
            key={task.id}
            onClick={() => navigate(`/tasks/${task.id}`)}
            className="lm-row cursor-pointer"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleToggle(task.id, task.completed); }}
              className={`lm-check ${isCompleted ? "done" : ""}`}
              aria-label={`${isCompleted ? "Reopen" : "Complete"} ${task.title}`}
            />
            <span className={`min-w-0 flex-1 truncate font-medium ${isCompleted ? "lm-strike" : ""}`}>{task.title}</span>
            {!isCompleted && task.priority === "high" && <span className="lm-chip lm-chip-h">High</span>}
            <span className="lm-muted w-[52px] flex-none text-right">
              {isCompleted
                ? "Done"
                : task.due_date
                ? new Date(task.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : task.priority ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TasksWidget;
