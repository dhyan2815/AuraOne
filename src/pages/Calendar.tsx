import { useState, useMemo, useEffect, useCallback } from "react";
import { PlusIcon, Trash2, Calendar as CalendarIcon, Clock, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parse,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { getEvents, createEvent, deleteEvent, listenToEvents, Event } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedEvents = await getEvents(user.id);
      setEvents(fetchedEvents);
    } catch (error) {
      toast.error("Temporal sync failed");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    const channel: RealtimeChannel = listenToEvents(user.id, () => {
      fetchEvents();
    });
    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchEvents]);

  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => isSameDay(new Date(event.start_time), selectedDate)),
    [events, selectedDate]
  );

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const next6Days = Array.from({ length: 6 }, (_, i) => addDays(new Date(), i));

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
      toast.success("Timeline entry secured");
      setNewEventTitle("");
      setNewEventTime("");
    } catch (error) {
      toast.error("Failed to append event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Neutralize this event from the timeline?')) return;
    try {
      await deleteEvent(eventId);
      toast.success("Event neutralized");
    } catch (err) {
      toast.error("Neutralization failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} className="aurora-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Temporal Matrix</span>
          </div>
          <h1 className="text-5xl font-black text-aurora-on-surface tracking-tight">Timeline</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass px-6 py-3 rounded-2xl border border-primary/5 flex items-center gap-4">
             <button onClick={prevMonth} className="text-aurora-on-surface-variant hover:text-primary transition-colors">
               <ChevronLeft size={20} />
             </button>
             <span className="text-sm font-black uppercase tracking-widest min-w-[140px] text-center">
               {format(currentMonth, "MMMM yyyy")}
             </span>
             <button onClick={nextMonth} className="text-aurora-on-surface-variant hover:text-primary transition-colors">
               <ChevronRight size={20} />
             </button>
          </div>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="glass px-4 py-3 rounded-2xl border border-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/40 transition-all"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-panel p-8 rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5">
            <div className="grid grid-cols-7 mb-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-primary/40 py-4">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const dayEvents = events.filter((event) => isSameDay(new Date(event.start_time), day));
                const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');

                return (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`h-32 rounded-[1.5rem] p-3 transition-all cursor-pointer relative group ${
                      isSelected ? "glass border-primary/40 bg-white/60 shadow-lg" : 
                      isCurrentMonth ? "glass border-primary/5 hover:bg-white/40" : "opacity-20 pointer-events-none"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-xs font-black ${isToday(day) ? "text-primary aurora-glow" : "text-aurora-on-surface-variant"}`}>
                         {format(day, "d")}
                       </span>
                       {dayEvents.length > 0 && (
                         <div className="w-1.5 h-1.5 rounded-full bg-primary aurora-glow" />
                       )}
                    </div>
                    
                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className="text-[9px] font-bold text-primary truncate bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] font-black uppercase tracking-wider text-primary/40 pl-1">
                          + {dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-aurora-on-surface-variant flex items-center gap-2">
                  <Clock size={16} /> Day Intel
                </h3>
                <span className="text-[10px] font-bold opacity-40">{format(selectedDate, "MMM d, yyyy")}</span>
              </div>
              
              <div className="space-y-4">
                {eventsForSelectedDate.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-aurora-on-surface-variant/40 italic">Registry Clear</p>
                  </div>
                ) : (
                  eventsForSelectedDate.sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map(e => (
                    <motion.div 
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={e.id} 
                      className="glass p-4 rounded-2xl border border-primary/5 flex items-center justify-between group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl glass border border-primary/10 flex items-center justify-center text-primary/40">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-aurora-on-surface">{e.title}</h4>
                          <p className="text-[10px] font-bold text-primary/60 uppercase">{format(new Date(e.start_time), "p")}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEvent(e.id)} className="p-2 rounded-xl hover:bg-error/10 text-aurora-on-surface-variant hover:text-error transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-aurora-on-surface-variant flex items-center gap-2">
                <PlusIcon size={16} /> Append Timeline
              </h3>
              
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary/40 ml-2">Objective Title</label>
                  <input
                    type="text"
                    placeholder="New Matrix Node..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="input-aurora w-full py-3 px-6 text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary/40 ml-2">Temporal Marker</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="input-aurora w-full py-3 px-6 text-xs font-bold appearance-none"
                    required
                  />
                </div>
                <button type="submit" className="btn-aurora-primary w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20">
                  Secure Entry
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-[3rem] border border-primary/5 sticky top-8 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-aurora-on-surface flex items-center gap-3">
              <CalendarIcon size={16} className="text-primary" /> Sector Forecast
            </h3>
            
            <div className="space-y-2">
              {next6Days.map((day) => {
                const dayEvents = events.filter((e) => isSameDay(new Date(e.start_time), day));
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <motion.div
                    whileHover={{ x: 4 }}
                    key={day.getTime()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-5 border ${
                      isSelected ? "glass border-primary/30 bg-white/60 shadow-md" : "border-transparent hover:bg-white/20"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border ${
                      isToday(day) ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "glass border-primary/10 text-aurora-on-surface-variant"
                    }`}>
                      <span className="text-[8px] font-black uppercase">{format(day, "EEE")}</span>
                      <span className="text-sm font-black leading-none">{format(day, "d")}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-black text-aurora-on-surface uppercase tracking-widest">{format(day, "MMMM d")}</h4>
                      <p className={`text-[9px] font-bold uppercase transition-colors ${dayEvents.length > 0 ? "text-primary" : "text-aurora-on-surface-variant opacity-40"}`}>
                        {dayEvents.length === 0 ? "Clear Registry" : `${dayEvents.length} Active Nodes`}
                      </p>
                    </div>
                    
                    {dayEvents.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary aurora-glow" />
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="p-6 rounded-[2rem] glass border border-primary/10 bg-primary/5">
              <p className="text-[9px] font-black text-primary uppercase leading-relaxed text-center group">
                <span className="inline-block animate-pulse mr-2">•</span>
                Temporal Matrix Synchronized
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;