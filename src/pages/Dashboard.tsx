import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import WeatherWidget from '../components/widgets/WeatherWidget';
import NewsWidget from '../components/widgets/NewsWidget';
import TasksWidget from '../components/widgets/TasksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';


const Dashboard = () => {

  const [greeting, setGreeting] = useState('');

  // to set the greeting based on the current hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Initialize state for the user's name
  const [userName, setUserName] = useState('');

  const { user } = useAuth();

  // to fetch the user's name
  useEffect(() => {
    if (user) {
      // Supabase stores custom user data in user_metadata
      const name = user.user_metadata?.name || user.email;
      setUserName(name);
    }
  }, [user]);


  // Define animation variants for the container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Define animation variants for the items
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-2"
      >
        <h1 className="display-lg bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent italic">
          {greeting}, {userName.split(' ')[0]} ✨
        </h1>
        <p className="text-aurora-on-surface-variant font-medium tracking-wide">
          Your luminous workspace is ready for today's flow.
        </p>
      </motion.div>

      {/* Stats/Quick Glance (Optional extra for premium feel) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks', value: '12', color: 'primary' },
          { label: 'Events', value: '3', color: 'secondary' },
          { label: 'Unread', value: '5', color: 'tertiary' },
          { label: 'Focus', value: '4h', color: 'primary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass p-4 rounded-2xl flex flex-col justify-center items-center"
          >
            <span className="text-[0.6rem] uppercase tracking-widest text-primary/60 mb-1 font-bold">{stat.label}</span>
            <span className="text-xl font-bold text-aurora-on-surface">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Widget Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Weather - Large spanning 2 cols */}
        <motion.div variants={item} className="md:col-span-2">
          <div className="glass-card h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>
            <p className="section-header">Atmosphere</p>
            <WeatherWidget />
          </div>
        </motion.div>

        {/* Tasks Panel */}
        <motion.div variants={item}>
          <div className="glass-card h-full">
            <div className="flex justify-between items-center mb-6">
              <p className="section-header mb-0">Today's Flow</p>
              <button className="text-[0.65rem] font-bold text-primary hover:underline">View All</button>
            </div>
            <TasksWidget />
          </div>
        </motion.div>

        {/* News Feed */}
        <motion.div variants={item}>
          <div className="glass-card h-full">
            <p className="section-header">Insights</p>
            <NewsWidget />
          </div>
        </motion.div>
        
        {/* Calendar Widget spanning 2 columns if needed, but I'll keep it 1:2 or 2:1 */}
        <motion.div variants={item} className="md:col-span-2">
          <div className="glass-card h-full">
            <div className="flex justify-between items-center mb-6">
              <p className="section-header mb-0">Upcoming Moments</p>
              <button className="text-[0.65rem] font-bold text-primary hover:underline">Full Calendar</button>
            </div>
            <CalendarWidget />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

};

export default Dashboard;