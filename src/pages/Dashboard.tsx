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
  
  // To set greetings as per the day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // To fetch the user's name
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      }
    };
    fetchUserData();
  }, []);


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">
          {greeting} {userName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Here's your overview for today!</p>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="lg:col-span-2">
          <Card title="Weather" className="h-full">
            <WeatherWidget />
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card title="Tasks" actionIcon={<PlusIcon size={16} />} actionLabel="New task" actionHref="/tasks">
            <TasksWidget />
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card title="Calendar" actionLabel="View all" actionHref="/calendar">
            <CalendarWidget />
          </Card>
        </motion.div>
        
        <motion.div variants={item} className="lg:col-span-2">
          <Card title="Latest News" actionLabel="More news">
            <NewsWidget />
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;