import { useState, useMemo, useEffect } from "react";
import { format, addDays, isSameDay, parse } from "date-fns";
import { getEvents, createEvent, Event } from "../../hooks/useEvents";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Plus, X, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

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
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>This Week</span>
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
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
                                        : "bg-slate-50 dark:bg-gray-800/50 border-slate-200 dark:border-gray-700 hover:border-primary/20"
                                    }`}
                            >
                                <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-primary" : "text-slate-500"}`}>
                                    {format(day, "EEE")}
                                </span>
                                <span className={`text-2xl font-bold mt-1 ${isSelected ? "text-text" : "text-text"}`}>
                                    {format(day, "d")}
                                </span>
                                {hasEvents && (
                                    <motion.div layoutId="event-dot" className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
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
                                className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-3 border border-slate-200 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-primary">New Event</h3>
                                    <button type="button" onClick={() => setShowAddForm(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full">
                                        <X size={14} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="What's happening?"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg p-2 text-sm"
                                    required
                                />
                                <input
                                    type="time"
                                    value={newEventTime}
                                    onChange={(e) => setNewEventTime(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg p-2 text-sm"
                                    required
                                />
                                <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg text-sm">
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
                                <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <CalendarIcon className="text-primary/40" />
                                </div>
                                <p className="text-sm font-bold text-text">No events planned</p>
                                <p className="text-xs text-slate-500 mt-1 mb-6">Your schedule is light</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-primary/10 text-primary font-bold py-2 px-6 rounded-lg text-sm"
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
                                        className="group flex items-center gap-4 p-3 bg-slate-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all cursor-pointer border border-slate-200 dark:border-gray-700"
                                        onClick={handleEventClick}
                                    >
                                        <div className="w-1 h-10 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-text truncate">{event.title}</h4>
                                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                                <Clock size={12} className="mr-1.5" />
                                                {format(new Date(event.start_time), "p")}
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                                    </motion.div>
                                ))}
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full py-3 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border-dashed border-slate-300 dark:border-gray-600 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                                >
                                    <Plus size={12} className="inline mr-1" />
                                    Add Another
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};

export default CalendarWidget;
