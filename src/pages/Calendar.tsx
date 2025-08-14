import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, PlusIcon, Trash2 } from "lucide-react";
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
} from "date-fns";
import { useEvents, addEvent, deleteEvent } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const Calendar = () => {
  // State variables for managing calendar and event data
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State variables for add event form visibility and data
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  // user authentication
  const { user } = useAuth();

  // Custom hook to fetch events
  const events = useEvents(user?.uid || "");

  // Memoized events for the selected date
  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => isSameDay(event.date, selectedDate)),
    [events, selectedDate]
  );

  // Functions to navigate between months
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calculate dates for the calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate empty days before the start of the month
  const firstDayOfMonth = monthStart.getDay();
  const prevDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const emptyDaysBefore = Array.from({ length: prevDays });

  // Create an array to display the next 6 days
  const next6Days = Array.from({ length: 6 }, (_, i) => addDays(new Date(), i));

  // Handler to delete an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.uid) {
      console.error("User id is missing")
      return;
    }
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;
    try {
      await deleteEvent(user.uid, eventId);
      toast.success("Event deleted");
    } catch (err) {
      toast.error("Error deleting event")
    }
  };

  return (
    <div>
      <h1 className="text-3xl mb-2">Events</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 space-y-3">

        {/* Actual Calender Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-card p-2 light:border">

          {/* Current Month and Month Swapping */}
          <div className="flex items-center justify-around">
            <h2 className="text-xl">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <h2 className="text-2xl">
              Calender
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-1 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
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

          {/* All 7 Days */}
          <div className="grid grid-cols-7 gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-base font-medium text-slate-500 dark:text-slate-400"
              >
                {day}
              </div>
            ))}

            {/* Empty days before the start of the month */}
            {emptyDaysBefore.map((_, i) => (
              <div key={`empty-${i}`} className="h-14 p-2" />
            ))}

            {/* Render each day of the month */}
            {days.map((day) => {
              const dayEvents = events.filter((event) =>
                isSameDay(event.date, day)
              );
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={day.getTime()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-28 border rounded p-1 text-xs
                  ${isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""}
                  border-slate-300 dark:border-slate-700`}
                >
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-4 h-4  flex items-center justify-center rounded-full font-semibold text-sm ${isToday(day) ? " bg-blue-500 dark:bg-blue-500" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Renders Events on the specific day */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                        title={event.title}
                      >
                        • {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div
                        className="text-slate-500 dark:text-slate-400 
                        cursor-pointer text-xs"
                        // Scroll to the events
                        onClick={() => {
                          const eventsList = document.getElementById('events-list');
                          if (eventsList) {
                            eventsList.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Todays Schedule */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-5 light:border">

          <div className="flex-1 items-center justify-center">
            <h3 className="font-semibold mb-5 text-center">Today's Schedule</h3>
          </div>

          {/* Render the next 6 days */}
          <div className="space-y-4">
            {next6Days.map((day) => {
              const isSelectedMiniDay = isSameDay(day, selectedDate);
              const dayEvents = events.filter((event) =>
                isSameDay(event.date, day)
              );

              return (
                <div key={day.getTime()}>
                  <div
                    className={`flex justify-center ${isSelectedMiniDay
                      ? "text-primary-600 dark:text-primary-400"
                      : ""
                      }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center mr-3 ${isToday(day)
                        ? "bg-primary-500 text-white border-transparent"
                        : isSelectedMiniDay
                          ? "border-primary-500 text-primary-700 dark:text-primary-300"
                          : "border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <span className="text-xs">{format(day, "EEE")}</span>
                      <div className="font-semibold text-sm">
                        {format(day, "d")}
                      </div>
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

        {/* Add events - Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg dark:shadow-xl shadow-card p-2 pt-2 light:border">
          {/* Header with Date and Add Event Button */}
          <div className="flex justify-around items-center mb-3">
            <h3 className="font-medium text-lg">
              {format(selectedDate, "MMMM d, yyyy")} Events
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="p-0 px-1 py-1 m-0  button-primary flex items-center"
            >
              <PlusIcon size={16} className="mr-1" />
              Add Event
            </button>
          </div>

          {/* Event List */}
          <div id="events-list" className="space-y-2">
            {eventsForSelectedDate.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-3">
                No events scheduled.
              </p>
            ) : (
              eventsForSelectedDate.sort((a, b) => a.time.localeCompare(b.time)).map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between items-center px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700"
                >
                  <div className="event-title-and-time">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {event.time}
                    </p>
                  </div>

                  <button
                    className="text-gray-500 hover:text-red-700"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="inline" size={17} />
                  </button>
                </div>

              ))
            )}
          </div>

          {/* Add Event Form */}
          {showAddForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newEventTitle || !newEventTime || !user?.uid) return;

                await addEvent(user.uid, newEventTitle, newEventTime, selectedDate);
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

      </div>

    </div>
  );
};

export default Calendar;