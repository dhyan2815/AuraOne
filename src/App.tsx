import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MoonIcon, SunIcon } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NotePage from './pages/NotePage';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';

function App() {

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const {user, loading} = useAuth();

  if (loading) return <p>Loading..</p>

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-50 rounded-full bg-slate-200 dark:bg-slate-700 p-2 shadow-md transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="h-5 w-5" />
        ) : (
          <SunIcon className="h-5 w-5" />
        )}
      </button>
      <Routes>
        {!user ? (
          <>
            <Route path='*' element={<Navigate to='/login' replace />} />
            <Route path='/login' element={<Login />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notes/:id" element={<NotePage />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        )}  
      </Routes>
    </>
  );
}

export default App;