import { useState, useMemo } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { useEvents, addEvent } from "../../hooks/useEvents";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CalendarWidget = () => {
  const navigate = useNavigate();

  // State variables for add event form visibility and data
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const days = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));

  // Event handler to navigate to calendar page
  const handleEventClick = (eventId: string) => {
    // Navigate to calendar page with the selected date
    navigate(`/events?date=${selectedDate.toISOString().split('T')[0]}`);
  };

  return (
    <div>
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some((event) => isSameDay(event.date, day));

          return (
            <button
              key={day.getTime()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center justify-center min-w-[4rem] h-16 rounded-lg border transition-colors ${isSelected
                  ? "bg-primary-100 border-primary-300 dark:bg-primary-900/30 dark:border-primary-800"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
            >
              <span
                className={`text-xs font-medium ${isToday
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-slate-500 dark:text-slate-400"
                  }`}
              >
                {format(day, "EEE")}
              </span>
              <span
                className={`text-lg font-bold mt-1 ${isSelected ? "text-primary-700 dark:text-primary-300" : ""
                  }`}
              >
                {format(day, "d")}
              </span>
              {hasEvents && (
                <div
                  className={`w-1 h-1 rounded-full mt-1 ${isSelected
                    ? "bg-primary-500"
                    : "bg-slate-400 dark:bg-slate-500"
                    }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 pb-2">
        {eventsForSelectedDate.length === 0 && !showAddForm ? (
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400">
              {format(selectedDate, 'MMM d, yyyy')}
            </p>
            <button
              className="button-primary mt-2"
              onClick={() => setShowAddForm(true)}
            >
              Add Event
            </button>
          </div>
        ) : showAddForm ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newEventTitle || !newEventTime || !user?.uid) return;

              await addEvent(user.uid, newEventTitle, newEventTime, selectedDate);
              setNewEventTitle("");
              setNewEventTime("");
              setShowAddForm(false);
            }}
            className="space-y-2"
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
        ) : (

          eventsForSelectedDate.map((event) => (
            <div
              key={event.id}
              className="flex items-start rounded-md bg-slate-50 dark:bg-slate-800/50 p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              onClick={() => handleEventClick(event.id)}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {event.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
