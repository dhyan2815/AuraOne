import { useState, useMemo } from "react";
import { PlusIcon, ArrowLeft, ArrowRight } from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { useEvents } from "../hooks/useEvents";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  const events = useEvents();

  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => isSameDay(event.date, selectedDate)),
    [events, selectedDate]
  );

  const eventsThisMonth = useMemo(
    () => events.filter((event) => isSameMonth(event.date, currentMonth)),
    [events, currentMonth]
  );

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = monthStart.getDay();
  const prevDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const emptyDaysBefore = Array.from({ length: prevDays });

  const next5Days = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-base font-medium text-slate-500 dark:text-slate-400"
              >
                {day}
              </div>
            ))}

            {emptyDaysBefore.map((_, i) => (
              <div key={`empty-${i}`} className="h-24 p-1" />
            ))}

            {days.map((day) => {
              const dayEvents = eventsThisMonth.filter((event) =>
                isSameDay(event.date, day)
              );
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={day.getTime()}
                  className={`h-24 p-1 border border-slate-100 dark:border-slate-700 ${
                    isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="h-full relative">
                    <div
                      className={`absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                        isToday(day) ? "bg-primary-500 text-white" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </div>

                    {dayEvents.length > 0 && (
                      <div className="pt-8 px-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs p-1 mb-1 truncate rounded bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Today's Schedule</h3>
            </div>

            <div className="space-y-3">
              {next5Days.map((day) => {
                const isSelectedMiniDay = isSameDay(day, selectedDate);
                const dayEvents = events.filter((event) =>
                  isSameDay(event.date, day)
                );

                return (
                  <div key={day.getTime()}>
                    <div
                      className={`flex items-center py-2 cursor-pointer ${
                        isSelectedMiniDay
                          ? "text-primary-600 dark:text-primary-400"
                          : ""
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center mr-3 ${
                          isToday(day)
                            ? "bg-primary-500 text-white border-transparent"
                            : isSelectedMiniDay
                            ? "border-primary-500 text-primary-700 dark:text-primary-300"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span className="text-xs">{format(day, "EEE")}</span>
                        <span className="text-sm font-medium">
                          {format(day, "d")}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium">
                          {format(day, "MMMM d, yyyy")}
                        </span>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {dayEvents.length === 0
                            ? "No events"
                            : dayEvents.length === 1
                            ? "1 event"
                            : `${dayEvents.length} events`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-4">
            <h3 className="font-medium mb-4">
              {format(selectedDate, "MMMM d, yyyy")} Events
            </h3>

            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400 mb-3">
                  Feature Coming Soon!
                </p>
                {/* <button
                  onClick={() => setShowAddForm(true)}
                  className="button-primary"
                >
                  <PlusIcon size={16} className="mr-1" />
                  Add Event
                </button> */}

                {/* Inline form */}
                {showAddForm && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newEventTitle || !newEventTime) return;

                      const newEvent = {
                        id: Date.now().toString(),
                        title: newEventTitle,
                        time: newEventTime,
                        date: selectedDate,
                      };

                      events.push(newEvent); // Only works if your hook returns a mutable array
                      setShowAddForm(false);
                      setNewEventTitle("");
                      setNewEventTime("");
                    }}
                    className="mt-4 space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Event title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      required
                    />
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      required
                    />
                    <div className="flex space-x-2">
                      <button type="submit" className="button-primary">
                        Save
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50"
                  >
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {event.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
