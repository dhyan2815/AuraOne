import { useState, useMemo, useEffect, useCallback } from "react";
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday,
  startOfWeek, endOfWeek, parse,
  isSameMonth
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, X } from "lucide-react";
import { getEvents, createEvent, deleteEvent, listenToEvents, Event } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// Event accent colors cycling
const EVENT_ACCENTS = [
  { bar: "bg-primary", dateBg: "bg-primary/10", dateNum: "text-primary", dateMon: "text-primary/60", title: "group-hover:text-primary" },
  { bar: "bg-secondary", dateBg: "bg-secondary/10", dateNum: "text-secondary", dateMon: "text-secondary/60", title: "group-hover:text-secondary" },
  { bar: "bg-tertiary",   dateBg: "bg-tertiary/10",   dateNum: "text-tertiary",   dateMon: "text-tertiary/60",   title: "group-hover:text-tertiary" },
];

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const fetched = await getEvents(user.id);
      setEvents(fetched);
    } catch { toast.error("Schedule sync failed"); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    const channel: RealtimeChannel = listenToEvents(user.id, fetchEvents);
    return () => { channel.unsubscribe(); };
  }, [user, fetchEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_time), day));

  const upcomingEvents = useMemo(
    () => events
      .filter((e) => new Date(e.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 6),
    [events]
  );

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEventTitle || !newEventTime) return;
    try {
      const startTime = parse(newEventTime, "HH:mm", selectedDate);
      await createEvent(user.id, {
        title: newEventTitle.trim(),
        start_time: startTime.toISOString(),
        end_time: null,
        description: null,
      });
      toast.success("Event synchronized ✦");
      setNewEventTitle("");
      setNewEventTime("");
      setShowForm(false);
      fetchEvents();
    } catch { toast.error("Sync failed"); }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteEvent(id);
    toast.success("Event removed");
    fetchEvents();
  };

  return (
    <div className="app-page">
      <div className="grid max-w-7xl grid-cols-12 gap-5 mx-auto">

        {/* ── Left: Calendar hero + grid ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

          {/* Hero + Month Nav */}
          <motion.div
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-none text-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Events Calendar
              </h1>
              <p className="text-sm text-text-variant mt-2 font-medium">
                Manage your appointments, deadlines, and upcoming events.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-primary/10 glass px-4 py-3 shadow-xl shadow-primary/5 sm:gap-4 sm:px-6 transition-colors duration-500">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xl font-bold text-text min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            className="glass shadow-2xl shadow-primary/5 rounded-[2.5rem] p-6 lg:p-8 overflow-hidden transition-colors duration-500"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-4 mb-6">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary/60">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-3 sm:gap-4">
              {calendarDays.map((day) => {
                const dayEvents = eventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDay = isToday(day);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div
                    key={day.toString()}
                    onClick={() => { setSelectedDate(day); setShowForm(true); }}
                    className={`aspect-square relative flex flex-col items-center justify-center group cursor-pointer rounded-2xl transition-all duration-300 ${
                      isTodayDay
                        ? ""
                        : isSelected
                        ? "bg-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/10 scale-[1.05] z-10"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    {isTodayDay && (
                      <div className="absolute inset-1 sm:inset-2 bg-primary rounded-2xl shadow-lg shadow-primary/30" />
                    )}
                    <span
                      className={`z-10 font-bold text-sm transition-colors ${
                        isTodayDay
                          ? "text-white"
                          : isCurrentMonth
                          ? "text-text group-hover:text-primary"
                          : "text-text/20"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-3 flex gap-0.5 z-10">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${isTodayDay ? "bg-white" : "bg-tertiary"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Add Event Form for Selected Date */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                className="glass rounded-[2rem] p-6 lg:p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-text text-xl">
                      Add Event
                    </h3>
                    <p className="text-xs text-text-variant font-bold uppercase tracking-widest mt-1">
                      {format(selectedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-text-variant hover:text-text transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddEvent} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Event title…"
                    className="flex-1 input-aurora"
                  />
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="input-aurora sm:w-40"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl glass border border-primary/10 text-Primary hover:text-Primary hover:border-Primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10"                  >
                    <Plus size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Schedule</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Upcoming Events ── */}
        <div className="col-span-12 flex flex-col gap-6 pt-2 lg:col-span-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-text tracking-tight uppercase tracking-[0.2em] text-[10px]">Upcoming Events</h3>
            <button className="text-primary text-xs font-black uppercase hover:underline">View All</button>
          </div>

          <div className="space-y-4 pr-1">
            <AnimatePresence mode="popLayout">
              {upcomingEvents.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-text-variant px-4 py-8 text-center glass rounded-2xl"
                >
                  No upcoming events. Click a day to add one.
                </motion.p>
              ) : (
                upcomingEvents.map((ev, idx) => {
                  const accent = EVENT_ACCENTS[idx % EVENT_ACCENTS.length];
                  const evDate = new Date(ev.start_time);
                  return (
                    <motion.div
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass rounded-2xl p-4 flex gap-4 hover:translate-x-2 transition-transform cursor-pointer relative overflow-hidden group border border-primary/5"
                    >
                      {/* Accent bar */}
                      <div className={`w-1.5 absolute left-0 top-0 h-full ${accent.bar}`} />

                      {/* Date chip */}
                      <div className={`w-12 h-12 rounded-xl ${accent.dateBg} flex flex-col items-center justify-center flex-shrink-0 transition-colors`}>
                        <span className={`text-[10px] font-black uppercase ${accent.dateMon}`}>
                          {format(evDate, "MMM")}
                        </span>
                        <span className={`text-lg font-black ${accent.dateNum}`}>
                          {format(evDate, "dd")}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-text ${accent.title} transition-colors truncate`}>
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[0.6875rem] text-text-variant font-bold">
                            <Clock size={11} className="text-primary" /> {format(evDate, "hh:mm a")}
                          </span>
                          {ev.description && (
                            <span className="flex items-center gap-1 text-[0.6875rem] text-text-variant font-bold truncate">
                              <MapPin size={11} className="text-primary" />{ev.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteEvent(ev.id, e)}
                        className="text-text-variant hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>

            {/* New Event CTA */}
            <div className="mt-4 pt-2">
              <button
                onClick={() => setShowForm(true)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-secondary to-tertiary text-white font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em]"
              >
                <Plus size={20} />
                New Event
              </button>
            </div>

            {/* Promo card */}
            <div className="mt-4 glass rounded-[2rem] p-6 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-tertiary/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="bg-primary text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-wider">
                  Tip
                </span>
                <h5 className="text-base font-extrabold text-text mt-4">Sync with Aura AI</h5>
                <p className="text-xs text-text-variant mt-2 leading-relaxed font-medium">
                  Let Aura AI help you review conflicts and improve your schedule.
                </p>
                <button className="mt-5 px-6 py-2 bg-text text-background dark:bg-primary dark:text-white rounded-full text-[10px] font-black hover:scale-105 transition-transform uppercase tracking-widest shadow-lg">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
