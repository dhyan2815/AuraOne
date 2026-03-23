import { useState, useMemo, useEffect } from "react";
import { format, addDays, isSameDay, parse } from "date-fns";
import { getEvents, createEvent, Event } from "../../hooks/useEvents";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Plus, X, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CalendarWidget = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventTime, setNewEventTime] = useState("");
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        if (user) {
            getEvents(user.id).then(setEvents);
        }
    }, [user]);

    const eventsForSelectedDate = useMemo(
        () => events.filter((event) => isSameDay(new Date(event.start_time), selectedDate)),
        [events, selectedDate]
    );

    const days = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));

    const handleEventClick = () => {
        navigate(`/events?date=${selectedDate.toISOString().split('T')[0]}`);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex space-x-3 mb-6 overflow-x-auto pb-1 no-scrollbar">
                {days.map((day, idx) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const hasEvents = events.some((event) => isSameDay(new Date(event.start_time), day));

                    return (
                        <motion.button
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={day.getTime()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl transition-all border ${isSelected
                                    ? "bg-primary/10 border-primary shadow-sm"
                                    : "glass border-transparent hover:border-primary/20"
                                }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-primary" : "text-aurora-on-surface-variant"}`}>
                                {format(day, "EEE")}
                            </span>
                            <span className={`text-xl font-black mt-0.5 ${isSelected ? "text-aurora-on-surface" : "text-aurora-on-surface"}`}>
                                {format(day, "d")}
                            </span>
                            {hasEvents && (
                                <motion.div layoutId="event-dot" className="w-1 h-1 rounded-full bg-primary mt-1" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {showAddForm ? (
                        <motion.form
                            key="add-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!newEventTitle || !newEventTime || !user) return;
                                const startTime = parse(newEventTime, "HH:mm", selectedDate);
                                await createEvent(user.id, {
                                    title: newEventTitle,
                                    start_time: startTime.toISOString(),
                                    end_time: null,
                                    description: null,
                                });
                                setNewEventTitle("");
                                setNewEventTime("");
                                setShowAddForm(false);
                                getEvents(user.id).then(setEvents);
                            }}
                            className="glass-panel p-4 rounded-3xl space-y-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">New Event</h3>
                                <button type="button" onClick={() => setShowAddForm(false)} className="p-1 hover:bg-black/5 rounded-full">
                                    <X size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="What's happening?"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="input-aurora py-2 text-sm"
                                required
                            />
                            <input
                                type="time"
                                value={newEventTime}
                                onChange={(e) => setNewEventTime(e.target.value)}
                                className="input-aurora py-2 text-sm"
                                required
                            />
                            <button type="submit" className="btn-aurora-primary w-full py-2 text-xs">
                                Schedule Event
                            </button>
                        </motion.form>
                    ) : eventsForSelectedDate.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                <CalendarIcon className="text-primary/40" />
                            </div>
                            <p className="text-sm font-black text-aurora-on-surface">No events planned</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-aurora-on-surface-variant mt-1 mb-6">Your schedule is light</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn-aurora-secondary px-6 py-2 text-xs"
                            >
                                <Plus size={14} className="inline mr-2" />
                                Add Event
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div key="list" className="space-y-3">
                            {eventsForSelectedDate.map((event, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={event.id}
                                    className="group flex items-center gap-4 p-3 glass rounded-2xl hover:bg-white/50 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                                    onClick={handleEventClick}
                                >
                                    <div className="w-1 h-8 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-aurora-on-surface truncate">{event.title}</h4>
                                        <div className="flex items-center text-[10px] font-bold text-aurora-on-surface-variant mt-0.5">
                                            <Clock size={10} className="mr-1" />
                                            {format(new Date(event.start_time), "p")}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-aurora-on-surface-variant opacity-0 group-hover:opacity-100 transition-all" />
                                </motion.div>
                            ))}
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-3 glass rounded-2xl border-dashed border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                            >
                                <Plus size={12} className="inline mr-1" />
                                Add Another
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CalendarWidget;

