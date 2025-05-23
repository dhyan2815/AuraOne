import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  MicIcon, 
  MessagesSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const toggleSidebar = () => setExpanded(!expanded);
  const closeSidebar = () => setExpanded(true);
  
  const toggleVoiceRecognition = () => {
    setIsListening(!isListening);
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/notes', icon: <FileText size={20} />, label: 'Notes' },
    { path: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
    { path: '/calendar', icon: <CalendarIcon size={20} />, label: 'Calendar' },
  ];

  return (
    <>
      {expanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      <button 
        className="fixed top-4 left-4 z-30 md:hidden bg-white dark:bg-slate-800 rounded-md p-2 shadow-md"
        onClick={toggleSidebar}
      >
        {expanded ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <AnimatePresence>
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: expanded ? 0 : -280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-slate-800 shadow-lg md:shadow-none md:static md:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-600" />
                <h1 className="text-xl font-bold">AuraOne</h1>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-2 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`
                  }
                  onClick={closeSidebar}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-around mb-4">
                <button 
                  className={`p-2.5 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  onClick={toggleVoiceRecognition}
                  title="Voice commands"
                >
                  <MicIcon size={20} />
                </button>
                <NavLink
                  to="/chat"
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title="AI Chat"
                >
                  <MessagesSquare size={20} />
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => 
                    `p-2.5 rounded-full transition-colors ${
                      isActive 
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`
                  }
                  title="Settings"
                >
                  <SettingsIcon size={20} />
                </NavLink>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;