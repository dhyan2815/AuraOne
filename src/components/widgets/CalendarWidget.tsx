// Calendar Mini-Widget — Displays a dashboard calendar grid, selected date agenda list, and inline event creators.

import { useState, useMemo, useEffect } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse } from "date-fns";
import { getEvents, createEvent, Event } from "../../hooks/useEvents";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CalendarWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    if (user) getEvents(user.id).then(setEvents);
  }, [user]);

  // Compile dates array to render the current month's visual calendar grid (Monday-based offset).
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    const startDow = (getDay(start) + 6) % 7;
    const blanks = Array(startDow).fill(null);
    return [...blanks, ...days].slice(0, 35); // Cap cells to 35 to prevent layout overflows
  }, [selectedDate]);

  const eventsForSelected = useMemo(
    () => events.filter((e) => isSameDay(new Date(e.start_time), selectedDate)),
    [events, selectedDate]
  );

  const hasEvent = (day: Date | null) =>
    day ? events.some((e) => isSameDay(new Date(e.start_time), day)) : false;

  const isToday = (day: Date | null) => day ? isSameDay(day, new Date()) : false;
  const isSelected = (day: Date | null) => day ? isSameDay(day, selectedDate) : false;

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime || !user) return;
    const startTime = parse(newTime, "HH:mm", selectedDate);
    await createEvent(user.id, {
      title: newTitle,
      start_time: startTime.toISOString(),
      end_time: null,
      description: null,
    });
    setNewTitle("");
    setNewTime("");
    setShowAddForm(false);
    getEvents(user.id).then(setEvents);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 grid grid-cols-7 gap-1.5 text-center">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="lm-muted py-1 font-semibold">
            {d.charAt(0)}
          </span>
        ))}
        {calendarDays.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;
          const today = isToday(day);
          const selected = isSelected(day);
          const marked = hasEvent(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              aria-label={format(day, "PPPP")}
              aria-pressed={selected}
              className={`relative rounded-[14px] py-2.5 text-sm font-semibold transition-colors ${
                today
                  ? "bg-today text-[#1F211E]"
                  : selected
                  ? "bg-step"
                  : "hover:bg-step"
              }`}
            >
              {format(day, "d")}
              {marked && (
                <span className="mx-auto mt-0.5 block h-1.5 w-1.5 rounded-full bg-events" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 border-t border-step pt-4">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              onSubmit={handleAddEvent}
              className="sec-events grid gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">New event</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="lm-round !h-8 !w-8 !bg-step" aria-label="Cancel">
                  <X size={14} />
                </button>
              </div>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Event name…"
                className="lm-input"
              />
              <input
                required
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="lm-input"
              />
              <button type="submit" className="lm-btn">Add</button>
            </motion.form>
          ) : eventsForSelected.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start gap-2 py-2"
            >
              <p className="font-bold">Nothing on {format(selectedDate, "MMM d")}</p>
              <button onClick={() => setShowAddForm(true)} className="lm-btn lm-btn-soft lm-btn-sm">
                <Plus size={14} strokeWidth={3} /> Add event
              </button>
            </motion.div>
          ) : (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {eventsForSelected.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events?date=${selectedDate.toISOString().split("T")[0]}`)}
                  className="lm-row cursor-pointer"
                >
                  <span className="w-[72px] flex-none font-bold tabular-nums">{format(new Date(event.start_time), "p")}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
                </div>
              ))}
              <button onClick={() => setShowAddForm(true)} className="lm-btn lm-btn-soft lm-btn-sm mt-3">
                <Plus size={14} strokeWidth={3} /> Add event
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarWidget;
