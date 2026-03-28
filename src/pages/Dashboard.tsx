import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TasksWidget from '../components/widgets/TasksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import NewsWidget from '../components/widgets/NewsWidget';

// ─── Shared glass card base style ───────────────────────────────────────────
const glassCard =
  'rounded-[2rem] p-8 border border-white/30 relative overflow-hidden';
const glassStyle = {
  background: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
};

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
    <div className="p-8 max-w-[1440px] mx-auto w-full">
      {/* ── Hero Heading ──────────────────────────────────── */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1
          className="font-extrabold tracking-tight text-on-surface leading-tight"
          style={{ fontSize: '3.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {greeting}, {userName}{' '}
          <span className="text-pink-400">✨</span>
        </h1>
        <p className="text-lg text-slate-500 mt-2 max-w-2xl">
          Your sanctuary is ready. Focus on what matters most.
        </p>
      </motion.div>

      {/* ── Bento Grid ────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-6"
      >
        {/* ── Widget 1: Weather  (8/12 cols) ── */}
        <motion.div
          variants={item}
          className={`col-span-12 lg:col-span-8 ${glassCard}`}
          style={{
            ...glassStyle,
            boxShadow: '0 0 30px 0 rgba(129,140,248,0.12)',
          }}
        >
          {/* decorative blur orb */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-400/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 h-full">
            <WeatherWidget />
          </div>
        </motion.div>

        {/* ── Widget 2: Tasks Panel  (4/12 cols) ── */}
        <motion.div
          variants={item}
          className={`col-span-12 lg:col-span-4 ${glassCard} flex flex-col`}
          style={{
            ...glassStyle,
            boxShadow: '0 0 30px 0 rgba(171,143,254,0.12)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight text-on-surface">
              Today's Tasks
            </h3>
            <button
              className="bg-indigo-100 text-indigo-600 p-2 rounded-full hover:bg-indigo-200 transition-colors"
              title="Add task"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1">
            <TasksWidget />
          </div>
        </motion.div>

        {/* ── Widget 3: Luminous Insights / News  (5/12 cols) ── */}
        <motion.div
          variants={item}
          className={`col-span-12 lg:col-span-5 ${glassCard}`}
          style={{
            ...glassStyle,
            boxShadow: '0 0 30px 0 rgba(232,105,172,0.12)',
          }}
        >
          <h3 className="text-xl font-bold tracking-tight text-on-surface mb-6">
            Luminous Insights
          </h3>
          <NewsWidget />
        </motion.div>

        {/* ── Widget 4: Calendar  (7/12 cols) ── */}
        <motion.div
          variants={item}
          className={`col-span-12 lg:col-span-7 ${glassCard} flex flex-col`}
          style={{
            ...glassStyle,
            boxShadow: '0 0 30px 0 rgba(129,140,248,0.12)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Your upcoming schedule</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white transition-colors text-slate-500">
                <ChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white transition-colors text-slate-500">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <CalendarWidget />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Floating Action Button ─────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full text-white flex items-center justify-center z-50 shadow-[0_10px_40px_rgba(73,83,188,0.40)]"
        style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
        title="Quick action"
      >
        <span className="text-2xl">✦</span>
      </motion.button>
    </div>
  );
};

export default Dashboard;