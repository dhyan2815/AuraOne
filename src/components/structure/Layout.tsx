import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const Layout = () => {
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

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background text-text transition-colors duration-300">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, ${theme === 'dark' ? 'rgba(99,102,241,0.18)' : 'rgba(129,140,248,0.12)'} 0%, transparent 45%),
            radial-gradient(circle at 80% 20%, ${theme === 'dark' ? 'rgba(168,85,247,0.16)' : 'rgba(171,143,254,0.12)'} 0%, transparent 45%),
            radial-gradient(circle at 50% 80%, ${theme === 'dark' ? 'rgba(236,72,153,0.12)' : 'rgba(232,105,172,0.08)'} 0%, transparent 55%)
          `,
        }}
      />

      <Sidebar />

      <main className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <motion.button
          onClick={toggleTheme}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all glass hover:scale-110 active:scale-95"
          style={{
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
            color: theme === 'dark' ? '#fbbf24' : '#6366f1',
          }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <motion.div
            key={theme}
            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </motion.div>
        </motion.button>


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
