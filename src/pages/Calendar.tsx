import { useState, useMemo, useEffect, useCallback } from "react";
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday,
  startOfWeek, endOfWeek, parse,
  isSameMonth
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react";
import { getEvents, createEvent, deleteEvent, listenToEvents, Event } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// Event accent colors cycling
const EVENT_ACCENTS = [
  { bar: "bg-indigo-500", dateBg: "bg-indigo-50", dateNum: "text-indigo-700", dateMon: "text-indigo-400", title: "group-hover:text-indigo-600" },
  { bar: "bg-purple-500", dateBg: "bg-purple-50", dateNum: "text-purple-700", dateMon: "text-purple-400", title: "group-hover:text-purple-600" },
  { bar: "bg-pink-500",   dateBg: "bg-pink-50",   dateNum: "text-pink-700",   dateMon: "text-pink-400",   title: "group-hover:text-pink-600" },
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
    } catch { toast.error("Temporal sync failed"); }
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
              <h1 className="text-2xl font-extrabold tracking-tight leading-none text-slate-900">
                Events
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Review your calendar and upcoming schedule.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/30 bg-white/25 px-4 py-3 shadow-[0_8px_32px_0_rgba(129,140,248,0.08)] backdrop-blur-[40px] sm:gap-4 sm:px-6">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-indigo-500/10 rounded-full transition-colors"
              >
                <ChevronLeft size={20} className="text-indigo-600" />
              </button>
              <span className="text-xl font-bold text-slate-800 min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-indigo-500/10 rounded-full transition-colors"
              >
                <ChevronRight size={20} className="text-indigo-600" />
              </button>
            </div>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            className="bg-white/25 backdrop-blur-[40px] border border-white/30 shadow-[0_8px_32px_0_rgba(129,140,248,0.08)] rounded-3xl p-5 overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-4 mb-6">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-indigo-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((day) => {
                const dayEvents = eventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDay = isToday(day);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div
                    key={day.toString()}
                    onClick={() => { setSelectedDate(day); setShowForm(true); }}
                    className={`aspect-square relative flex flex-col items-center justify-center group cursor-pointer rounded-2xl transition-all ${
                      isTodayDay
                        ? ""
                        : isSelected
                        ? "ring-2 ring-indigo-400/50"
                        : "hover:bg-indigo-50/50"
                    }`}
                  >
                    {isTodayDay && (
                      <div className="absolute inset-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20" />
                    )}
                    <span
                      className={`z-10 font-semibold text-sm transition-colors ${
                        isTodayDay
                          ? "text-white font-bold"
                          : isCurrentMonth
                          ? "text-slate-700 group-hover:text-indigo-600"
                          : "text-slate-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-3 flex gap-0.5 z-10">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${isTodayDay ? "bg-white" : "bg-pink-400"}`}
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-white/25 backdrop-blur-[40px] border border-white/30 rounded-[2rem] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">
                    Add event — {format(selectedDate, "MMM d, yyyy")}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
                </div>
                <form onSubmit={handleAddEvent} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Event title…"
                    className="flex-1 bg-white/50 border border-white/30 rounded-full px-5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="bg-white/50 border border-white/30 rounded-full px-5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Plus size={16} /> Add
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Upcoming Events ── */}
        <div className="col-span-12 flex flex-col gap-6 pt-2 lg:col-span-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>

          <div className="space-y-4 pr-1">
            <AnimatePresence>
              {upcomingEvents.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-slate-400 px-2"
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
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white/25 backdrop-blur-[40px] border border-white/30 shadow-[0_8px_32px_0_rgba(129,140,248,0.08)] rounded-2xl p-4 flex gap-4 hover:translate-x-2 transition-transform cursor-pointer relative overflow-hidden group"
                    >
                      {/* Accent bar */}
                      <div className={`w-1.5 absolute left-0 top-0 h-full ${accent.bar}`} />

                      {/* Date chip */}
                      <div className={`w-12 h-12 rounded-xl ${accent.dateBg} flex flex-col items-center justify-center flex-shrink-0`}>
                        <span className={`text-[10px] font-bold uppercase ${accent.dateMon}`}>
                          {format(evDate, "MMM")}
                        </span>
                        <span className={`text-lg font-black ${accent.dateNum}`}>
                          {format(evDate, "dd")}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-slate-900 ${accent.title} transition-colors truncate`}>
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[0.6875rem] text-slate-500">
                            <Clock size={11} /> {format(evDate, "hh:mm a")}
                          </span>
                          {ev.description && (
                            <span className="flex items-center gap-1 text-[0.6875rem] text-slate-500">
                              <MapPin size={11} />{ev.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteEvent(ev.id, e)}
                        className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        ×
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
                className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={20} />
                New Event
              </button>
            </div>

            {/* Promo card */}
            <div className="mt-4 bg-white/25 backdrop-blur-[40px] border border-white/30 rounded-3xl p-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/40 to-purple-200/40" />
              <div className="relative z-10">
                <span className="bg-indigo-600 text-[10px] font-bold text-white px-2 py-1 rounded-full uppercase tracking-wider">
                  Tip
                </span>
                <h5 className="text-base font-bold text-slate-900 mt-3">Sync with Aura AI</h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Let Aura AI help you review conflicts and improve your schedule.
                </p>
                <button className="mt-4 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-indigo-600 text-xs font-bold hover:bg-white transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Action Button */}
      <div className="fixed bottom-6 right-6 z-30 hidden lg:block">
        <button className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-[40px] border border-white/30 shadow-[0_8px_32px_0_rgba(129,140,248,0.08)] flex items-center justify-center text-indigo-600 hover:rotate-12 transition-transform shadow-2xl text-2xl">
          ✦
        </button>
      </div>
    </div>
  );
};

export default Calendar;

