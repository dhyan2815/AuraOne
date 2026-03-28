import { useState, useMemo, useEffect } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse } from "date-fns";
import { getEvents, createEvent, Event } from "../../hooks/useEvents";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Clock, Plus, X, ChevronRight } from "lucide-react";
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

  // Build mini calendar grid for current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    // pad start: Monday=0 ... Sunday=6
    const startDow = (getDay(start) + 6) % 7; // convert Sun=0 to Mon=0
    const blanks = Array(startDow).fill(null);
    return [...blanks, ...days].slice(0, 35);
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
    <div className="h-full flex flex-col">
      {/* Mini calendar grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center mb-6">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1">
            {d}
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
              className={`relative mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                today && !selected
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200/60"
                  : selected
                  ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
                  : "text-slate-700 hover:bg-white/60"
              }`}
            >
              {format(day, "d")}
              {marked && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-white/20 pt-4 flex-1">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleAddEvent}
              className="space-y-3 bg-white/30 rounded-2xl p-4 border border-white/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">New Event</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={13} />
                </button>
              </div>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <input
                required
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm hover:bg-indigo-600 transition-colors">
                Schedule
              </button>
            </motion.form>
          ) : eventsForSelected.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-4 gap-2"
            >
              <p className="text-sm text-slate-400">No events on {format(selectedDate, "MMM d")}</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <Plus size={13} /> Add event
              </button>
            </motion.div>
          ) : (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {eventsForSelected.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/events?date=${selectedDate.toISOString().split("T")[0]}`)}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-1.5 h-10 bg-indigo-500 rounded-full group-hover:bg-indigo-600 transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">{event.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {format(new Date(event.start_time), "p")}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-indigo-600 transition-opacity flex items-center gap-1">
                    View <ChevronRight size={12} />
                  </button>
                </motion.div>
              ))}
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mt-2 transition-colors"
              >
                <Plus size={13} /> Add another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarWidget;
