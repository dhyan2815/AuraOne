import { useState, useMemo } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { useEvents } from '../../../dist/hooks/useEvents';

const CalendarWidget = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const events = useEvents();

  const eventsForSelectedDate = useMemo(
    () => events.filter(event => isSameDay(event.date, selectedDate)),
    [events, selectedDate]
  );

  const days = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));

  return (
    <div>
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some(event => isSameDay(event.date, day));

          return (
            <button
              key={day.getTime()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center justify-center min-w-[4rem] h-16 rounded-lg border transition-colors ${
                isSelected
                  ? 'bg-primary-100 border-primary-300 dark:bg-primary-900/30 dark:border-primary-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`text-lg font-bold mt-1 ${isSelected ? 'text-primary-700 dark:text-primary-300' : ''}`}>
                {format(day, 'd')}
              </span>
              {hasEvents && (
                <div className={`w-1 h-1 rounded-full mt-1 ${
                  isSelected ? 'bg-primary-500' : 'bg-slate-400 dark:bg-slate-500'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {eventsForSelectedDate.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400">
              Event Scheduling Coming Soon! 
              {/* {format(selectedDate, 'MMM d, yyyy')} */}
            </p>
          </div>
        ) : (
          eventsForSelectedDate.map(event => (
            <div key={event.id} className="flex items-start p-3 rounded-md bg-slate-50 dark:bg-slate-800/50">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{event.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;