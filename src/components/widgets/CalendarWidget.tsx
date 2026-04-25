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
          <span key={d} className="text-[9px] font-black text-text-variant uppercase tracking-[0.2em] py-1 opacity-50">
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
              className={`relative mx-auto w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all duration-300 ${
                today && !selected
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : selected
                  ? "bg-primary text-white shadow-xl shadow-primary/40 ring-2 ring-primary/20 scale-110"
                  : "text-text hover:bg-primary/10 hover:scale-105"
              }`}
            >
              {format(day, "d")}
              {marked && !selected && !today && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tertiary rounded-full shadow-[0_0_5px_rgba(139,92,246,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-primary/10 pt-6 flex-1">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddEvent}
              className="space-y-3 glass border border-primary/10 rounded-2xl p-5 shadow-2xl shadow-primary/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">New Event</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="p-1.5 rounded-xl hover:bg-primary/10 transition-colors text-text-variant active:scale-90">
                  <X size={14} />
                </button>
              </div>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Event name…"
                className="input-aurora w-full py-3 px-4 text-xs font-bold"
              />
              <input
                required
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="input-aurora w-full py-3 px-4 text-xs font-bold"
              />
              <button 
                type="submit" 
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Add
              </button>
            </motion.form>
          ) : eventsForSelected.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 gap-3 text-center"
            >
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border border-primary/5">
                    <Clock size={20} className="text-primary/30" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-text">Daily Agenda</p>
                    <p className="text-[9px] font-bold text-text-variant opacity-60 uppercase tracking-widest">No events logged on {format(selectedDate, "MMM d")}</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="text-[10px] font-black text-primary hover:text-primary/80 flex items-center gap-2 transition-all uppercase tracking-[0.3em] bg-primary/5 px-5 py-2.5 rounded-xl border border-primary/10 mt-2"
                >
                    <Plus size={14} strokeWidth={3} /> Initial Event
                </button>
            </motion.div>
          ) : (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {eventsForSelected.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/events?date=${selectedDate.toISOString().split("T")[0]}`)}
                  className="flex items-center gap-5 group cursor-pointer glass p-3.5 rounded-2xl border border-primary/5 hover:border-primary/20 hover:shadow-xl transition-all"
                >
                  <div className="w-1 h-10 bg-primary/20 rounded-full group-hover:bg-primary transition-all duration-500 group-hover:w-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text group-hover:text-primary transition-colors leading-tight line-clamp-1">{event.title}</p>
                    <p className="text-[9px] text-text-variant flex items-center gap-1.5 mt-1.5 uppercase tracking-[0.2em] font-black opacity-60">
                      <Clock size={10} strokeWidth={3} className="text-primary" />
                      {format(new Date(event.start_time), "p")}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </motion.div>
              ))}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mt-4 flex items-center justify-center gap-3 py-3.5 rounded-2xl glass border border-primary/10 text-primary hover:text-primary hover:border-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10"
              >
                <Plus size={16} strokeWidth={4} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Event</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarWidget;
