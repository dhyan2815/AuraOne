// Render the Calendar workspace interface, displaying monthly grid cells, upcoming schedules, and event scheduler dialog forms.

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday,
  startOfWeek, endOfWeek, parse,
  isSameMonth
} from "date-fns";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, MapPin, X } from "lucide-react";
import { LmDialog } from "../components/ui/Dialog";
import { getEvents, createEvent, deleteEvent, listenToEvents, Event } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// Array of headers representing days of the week starting from Monday.
const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = () => {
  // Track selected calendar views, schedule details state, and popover overlays.
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  // Retrieve user events list from Supabase storage mapping event schemas.
  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const fetched = await getEvents(user.id);
      setEvents(fetched);
    } catch { toast.error("Schedule sync failed"); }
  }, [user]);

  // Sync scheduled calendar items and bind a Supabase Postgres changes subscription to live events.
  useEffect(() => {
    if (!user) return;
    fetchEvents();
    const channel: RealtimeChannel = listenToEvents(user.id, fetchEvents);
    
    // Clean up Supabase channels on unmount or user swap.
    return () => { channel.unsubscribe(); };
  }, [user, fetchEvents]);

  // Construct dates range structures for rendering the standard 7-column monthly grid.
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Filter events belonging to a specific day cell.
  const eventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_time), day));

  // Compute a list of up to 6 upcoming events using useMemo optimizations.
  const upcomingEvents = useMemo(
    () => events
      .filter((e) => new Date(e.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 6),
    [events]
  );

  // Submit and save a new event record to Supabase, parsing the date-time values.
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

  // Terminate and delete an event record from the database.
  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteEvent(id);
    toast.success("Event removed");
    fetchEvents();
  };

  const selectedEvents = eventsForDay(selectedDate)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const monthCount = events.filter((e) => isSameMonth(new Date(e.start_time), currentMonth)).length;
  const next = upcomingEvents[0];

  const EventRow = ({ ev }: { ev: Event }) => (
    <div className="group grid grid-cols-[64px_minmax(0,1fr)_28px] items-start gap-3 py-3">
      <span className="font-bold tabular-nums">{format(new Date(ev.start_time), "HH:mm")}</span>
      <div className="min-w-0 rounded-[18px] bg-events px-3.5 py-2.5 text-[#1F211E]">
        <b className="block truncate">{ev.title}</b>
        {ev.description && (
          <span className="flex items-center gap-1 text-sm"><MapPin size={12} />{ev.description}</span>
        )}
      </div>
      <button
        onClick={(e) => handleDeleteEvent(ev.id, e)}
        className="grid h-7 w-7 place-items-center rounded-full text-ink2 transition hover:bg-alert/10 hover:text-alert"
        aria-label={`Delete ${ev.title}`}
      >
        <X size={16} />
      </button>
    </div>
  );

  return (
    <div className="sec-events">
      <section className="lm-lobe">
        <h1>{format(currentMonth, "MMMM")}</h1>
        <p>
          {monthCount} {monthCount === 1 ? "event" : "events"} this month
          {next ? ` · next: ${next.title}, ${format(new Date(next.start_time), "EEE d, HH:mm")}.` : "."}
        </p>
        <div className="lm-acts">
          <button onClick={() => setShowForm(true)} className="lm-btn">
            <Plus size={16} strokeWidth={3} /> New event
          </button>
          <Link to="/chat" className="lm-btn lm-btn-ghost">Ask Aura to add one</Link>
        </div>
      </section>

      <div className="lm-lift grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="lm-sheet">
          <div className="mb-3.5 flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="lm-round !bg-step"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <b className="min-w-[140px] text-center text-xl">{format(currentMonth, "MMMM yyyy")}</b>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="lm-round !bg-step"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAY_HEADERS.map((d) => (
              <span key={d} className="pb-1 text-center text-[13px] font-bold text-ink2">{d}</span>
            ))}
            {calendarDays.map((day) => {
              const dayEvents = eventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDay = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toString()}
                  onClick={() => { setSelectedDate(day); setShowForm(true); }}
                  aria-label={format(day, "PPPP")}
                  className={`flex min-h-[52px] flex-col items-stretch gap-1 rounded-[18px] p-2 text-left font-semibold tabular-nums transition-colors sm:min-h-[84px] sm:px-2.5 ${
                    isTodayDay
                      ? "bg-events text-[#1F211E]"
                      : isSelected
                      ? "bg-water ring-2 ring-events"
                      : "bg-water hover:ring-2 hover:ring-events/50"
                  } ${isCurrentMonth ? "" : "opacity-40"}`}
                >
                  <span>{format(day, "d")}</span>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <span
                      key={ev.id}
                      className={`hidden truncate rounded-full px-2 py-px text-xs font-semibold sm:block ${isTodayDay ? "bg-white/70 text-[#1F211E]" : "bg-sheet text-ink"}`}
                    >
                      {ev.title}
                    </span>
                  ))}
                  {dayEvents.length > 0 && (
                    <span className="mt-auto flex gap-0.5 sm:hidden">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <span key={i} className={`h-1 w-1 rounded-full ${isTodayDay ? "bg-[#1F211E]" : "bg-events"}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lm-sheet">
          <h2 className="lm-sheet-title">{format(selectedDate, "EEEE d")}</h2>
          {selectedEvents.length === 0 ? (
            <p className="lm-muted py-3">Nothing scheduled. Click a day to add an event.</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {selectedEvents.map((ev) => (
                <motion.div key={ev.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <EventRow ev={ev} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          <h2 className="lm-sheet-title mt-5">Coming up</h2>
          {upcomingEvents.length === 0 ? (
            <p className="lm-muted py-2">No upcoming events.</p>
          ) : (
            upcomingEvents.map((ev) => (
              <div key={ev.id} className="lm-row">
                <span className="w-16 flex-none font-bold">{format(new Date(ev.start_time), "EEE d")}</span>
                <span className="min-w-0 flex-1 truncate">{ev.title}, {format(new Date(ev.start_time), "HH:mm")}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <LmDialog
        open={showForm}
        onOpenChange={setShowForm}
        title="New event"
        subtitle={format(selectedDate, "EEEE d MMMM")}
        sec="sec-events"
      >
        <form onSubmit={handleAddEvent} className="grid gap-3.5">
          <label className="lm-field">
            Title
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Meeting, deadline, dinner…"
              className="lm-input"
            />
          </label>
          <label className="lm-field">
            Starts
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              className="lm-input"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="lm-btn lm-btn-soft" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="lm-btn">Save event</button>
          </div>
        </form>
      </LmDialog>
    </div>
  );
};

export default Calendar;
