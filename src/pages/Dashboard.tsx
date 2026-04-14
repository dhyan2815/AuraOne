import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TasksWidget from '../components/widgets/TasksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import NewsWidget from '../components/widgets/NewsWidget';
import Logo from '../components/structure/Logo';

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0] || '');
    }
  }, [user]);

  // animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="app-page">
      {/* ── Hero Heading ──────────────────────────────────── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1
          className="text-3xl font-extrabold tracking-tight text-text leading-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {greeting}, {userName}{' '}
        </h1>
        <p className="text-sm text-text-variant mt-1 max-w-xl font-medium">
          A quick overview of your goals, upcoming schedule, and latest news.
        </p>
      </motion.div>

      {/* ── Bento Grid ────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-5 lg:gap-6"
      >
        {/* ── Widget 1: Weather (8/12 cols) ── */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-8 glass p-6 lg:p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 transition-all duration-500 overflow-hidden relative"
        >
          {/* decorative blur orbs */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-50" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/10 blur-[100px] rounded-full pointer-events-none opacity-50" />
          
          <div className="relative z-10 h-full">
            <WeatherWidget />
          </div>
        </motion.div>

        {/* ── Widget 2: Tasks Panel (4/12 cols) ── */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-4 glass p-6 lg:p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col transition-all duration-500"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text opacity-60">
                ACTIVE TASKS
            </h3>
            <button
              className="bg-primary/10 text-primary p-2.5 rounded-2xl hover:bg-primary/20 transition-all hover:rotate-90 active:scale-95 shadow-lg shadow-primary/5"
              title="Add objective"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
          <div className="flex-1">
            <TasksWidget />
          </div>
        </motion.div>

        {/* ── Widget 3: News (5/12 cols) ── */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-5 glass p-6 lg:p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 transition-all duration-500"
        >
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text mb-6 opacity-60">
            LATEST NEWS
          </h3>
          <NewsWidget />
        </motion.div>

        {/* ── Widget 4: Calendar (7/12 cols) ── */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-7 glass p-6 lg:p-8 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col transition-all duration-500"
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text opacity-60">
                MY SCHEDULE
              </h3>
              <p className="text-xl font-extrabold text-text mt-2 tracking-tight">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-xl glass border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all active:scale-90 text-text-variant">
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button className="w-10 h-10 rounded-xl glass border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all active:scale-90 text-text-variant">
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <CalendarWidget />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Quick Action Trigger ─────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-30 hidden lg:flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-2xl shadow-primary/30"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))' }}
        title="Quick Action"
      >
        <Logo iconOnly iconClassName="w-7 h-7 filter brightness-200 contrast-125" />
      </motion.button>
    </div>
  );
};

export default Dashboard;
