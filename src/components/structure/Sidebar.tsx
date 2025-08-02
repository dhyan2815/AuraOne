import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Menu,
  X,
  MoonIcon,
  SunIcon,
  Sparkles,
  MessagesSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const [expanded, setExpanded] = useState(true);

  // State to manage theme
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (
      (savedTheme as "light" | "dark") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  // Store theme in localStorage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Theme Changes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => setExpanded(!expanded);
  const closeSidebar = () => setExpanded(true);

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

  // Logout Logic
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    toast.success("Log out successfully")
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: <LayoutDashboard size={22} />,
      label: "Dashboard",
    },
    { path: "/notes", icon: <FileText size={22} />, label: "Notes" },
    { path: "/tasks", icon: <CheckSquare size={22} />, label: "Tasks" },
    { path: "/events", icon: <CalendarIcon size={22} />, label: "Events" },
    {
      path: "/login",
      icon: <LogOut size={20} />,
      label: "LogOut",
      onclick: handleLogout,
    },
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
          className={`fixed inset-y-0 left-0 z-20 bg-white dark:bg-slate-800 shadow-lg md:shadow-none md:static md:translate-x-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-[100px]' : 'w-64'
          }`}
        >
          <div className="flex flex-col h-full dark:shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-slate-200 dark:border-slate-700">
              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.div
                    key="expanded-header"
                    initial={{ opacity: 1, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <h1 className="text-lg font-bold truncate">AuraOne</h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{userName}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed-header"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-center w-full"  
                  >
                    <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <button
                      onClick={onToggleCollapse}
                      className="md:flex p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Collapse/Expand Button - Only show when expanded */}
              {!isCollapsed && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden md:flex p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md transition-colors group ${
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  onClick={
                    item.onclick ? item.onclick : () => navigate(item.path)
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <div className={`flex ${isCollapsed ? 'flex-col space-y-2' : 'justify-around'} gap-x-1`}>
                {/* Theme */}
                <div className={`${isCollapsed ? 'flex justify-center' : 'flex-1'}`}>
                  <button
                    onClick={toggleTheme}
                    className="flex p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    aria-label="Toggle theme"
                    title={isCollapsed ? "Theme" : undefined}
                  >
                    {theme === "light" ? (
                      <MoonIcon size={18} />
                    ) : (
                      <SunIcon size={18} />
                    )}
                  </button>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-xs flex justify-center text-slate-600 dark:text-slate-300 mt-1"
                      >
                        Theme
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Aura Assistant */}
                <div className={`${isCollapsed ? 'flex justify-center' : 'flex-1'}`}>
                  <NavLink
                    to="/chat"
                    className={({ isActive }) =>
                      `flex p-3 rounded-full transition-colors ${
                        isActive
                          ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                          : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`
                    }
                    title={isCollapsed ? "Chat with AI" : undefined}
                  >
                    <MessagesSquare size={18} />
                  </NavLink>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-xs flex justify-center text-slate-600 dark:text-slate-300 mt-1"
                      >
                        Aura
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings */}
                <div className={`${isCollapsed ? 'flex justify-center' : 'flex-1'}`}>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex p-3 rounded-full transition-colors ${
                        isActive
                          ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                          : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`
                    }
                    title={isCollapsed ? "Settings" : undefined}
                  >
                    <SettingsIcon size={18} />
                  </NavLink>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-xs flex justify-center text-slate-600 dark:text-slate-300 mt-1"
                      >
                        Settings
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;