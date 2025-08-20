import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import WeatherWidget from '../components/widgets/WeatherWidget';
import NewsWidget from '../components/widgets/NewsWidget';
import TasksWidget from '../components/widgets/TasksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../services/firebase";

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

  // to fetch the user's name from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; // Check if a user is logged in
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      }
    };
    fetchUserData();
  }, []);


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
    <div>
      {/* greeting and user name */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">
          {greeting} {userName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Here's your overview for today!</p>
      </div>

      {/* Motion div container for the widgets */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="lg:col-span-2 dark:shadow-xl">
          <Card title="Weather" className="h-full">
            <WeatherWidget />
          </Card>
        </motion.div>

        {/* Tasks Widget */}
        <motion.div variants={item} className='dark:shadow-xl dark:hover:shadow-2xl transition-transform-30'>
          <Card title="Tasks" actionLabel="View all" actionHref="/tasks">
            <TasksWidget />
          </Card>
        </motion.div>

        {/* News Widget */}
        <motion.div variants={item} className="lg:col-span-2 dark:shadow-xl dark:hover:shadow-2xl transition-transform-30">
          <Card title="Latest News" actionLabel="More news">
            <NewsWidget />
          </Card>
        </motion.div>
        
        {/* Calendar Widget */}
        <motion.div variants={item} className='dark:shadow-xl dark:hover:shadow-2xl transition-transform-30'>
          <Card title="Events" actionLabel="View all" actionHref="/events">
            <CalendarWidget />
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;