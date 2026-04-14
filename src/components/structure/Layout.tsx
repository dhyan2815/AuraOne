import { useState } from 'react';
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

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'U';

  return (
    <div className="flex min-h-screen text-text bg-background overflow-x-hidden">
      {/* Aurora mesh background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(129,140,248,0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(171,143,254,0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(232,105,172,0.10) 0%, transparent 50%)
          `,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* Top App Bar */}
        <header
          className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-5"
          style={{
            background: 'rgba(250,248,253,0.60)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(198,197,213,0.20)',
          }}
        >
          {/* Search */}
          <div className="relative hidden max-w-sm flex-1 items-center gap-3 group md:flex">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search workspace..."
              className="w-full bg-[#e9e7ec]/50 border-none rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-indigo-50/60 text-slate-500 transition-colors"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button className="p-1.5 rounded-full hover:bg-indigo-50/60 text-slate-500 transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-pink-400 rounded-full" />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
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
