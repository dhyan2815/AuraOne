import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background text-text dark:bg-slate-950 dark:text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, ${theme === 'dark' ? 'rgba(99,102,241,0.22)' : 'rgba(129,140,248,0.15)'} 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, ${theme === 'dark' ? 'rgba(168,85,247,0.20)' : 'rgba(171,143,254,0.15)'} 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, ${theme === 'dark' ? 'rgba(236,72,153,0.16)' : 'rgba(232,105,172,0.10)'} 0%, transparent 50%)
          `,
        }}
      />

      <Sidebar />

      <main className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <header
          className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-5"
          style={{
            background: theme === 'dark' ? 'rgba(15,23,42,0.72)' : 'rgba(250,248,253,0.60)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: theme === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(198,197,213,0.20)',
          }}
        >
          <div className="group relative hidden max-w-sm flex-1 items-center gap-3 md:flex">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search workspace..."
              className="w-full rounded-full border-none bg-[#e9e7ec]/50 py-1.5 pl-9 pr-4 text-xs text-slate-700 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleTheme}
              className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-indigo-50/60 dark:text-slate-300 dark:hover:bg-slate-800/80"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              className="relative rounded-full p-1.5 text-slate-500 transition-colors hover:bg-indigo-50/60 dark:text-slate-300 dark:hover:bg-slate-800/80"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-pink-400" />
            </button>

            <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-100">{userName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Account</p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-xs font-bold text-white shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
