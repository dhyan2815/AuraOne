// Render the user's Today page: green lobe greeting with Tasks, schedule, weather and news sheets lifted over it.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TasksWidget from '../components/widgets/TasksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import NewsWidget from '../components/widgets/NewsWidget';

const Dashboard = () => {
  // Access global user context to personalize the greeting.
  const { user } = useAuth();

  // Track personalized greeting messages and user display names.
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('');

  // Dynamically set the time-of-day greeting (Morning, Afternoon, Evening).
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Update name representation when the authenticated user profile loads or changes.
  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0] || '');
    }
  }, [user]);

  return (
    <div className="sec-today">
      <section className="lm-lobe">
        <h1>{greeting}{userName ? `, ${userName}` : ''}</h1>
        <p>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · A quick
          overview of your goals, upcoming schedule, and latest news.
        </p>
        <div className="lm-acts">
          <Link to="/chat" className="lm-btn">Ask Aura</Link>
          <Link to="/tasks" className="lm-btn lm-btn-ghost">Open tasks</Link>
        </div>
      </section>

      <div className="lm-lift lm-stagger grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="lm-sheet sec-tasks">
          <h2 className="lm-sheet-title">
            <span className="lm-dot" />
            Tasks
            <Link to="/tasks" className="lm-muted ml-auto font-semibold">All tasks</Link>
          </h2>
          <TasksWidget />
        </div>

        <div className="lm-sheet sec-events">
          <h2 className="lm-sheet-title">
            <span className="lm-dot" />
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <CalendarWidget />
        </div>

        <div className="grid content-start gap-5">
          <div className="lm-sheet !bg-events text-[#1F211E]">
            <WeatherWidget />
          </div>
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">News</h2>
            <NewsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
