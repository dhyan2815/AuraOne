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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";

const Sidebar = () => {
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
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    { path: "/notes", icon: <FileText size={20} />, label: "Notes" },
    { path: "/tasks", icon: <CheckSquare size={20} />, label: "Tasks" },
    { path: "/events", icon: <CalendarIcon size={20} />, label: "Events" },
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
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-slate-800 shadow-lg md:shadow-none md:static md:translate-x-0`}
        >
          <div className="flex flex-col h-full dark:shadow-xl">
            <div className="flex items-center justify-center h-10 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-600" />
                <div className="block">
                  <h1 className="text-xl font-bold">AuraOne</h1>
                  <p className="text-start text-gray-600 dark:text-gray-400">{userName}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 rounded-md transition-colors ${isActive
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`
                  }
                  onClick={
                    item.onclick ? item.onclick : () => navigate(item.path)
                  } //will redirect to remaining paths
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-slate-200 dark:border-slate-700">
              <div className="flex justify-around mb-2 gap-x-1">

                {/* Theme */}
                <div className="flex-1">
                  <button
                    onClick={toggleTheme}
                    className="flex p-2.5 mb-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === "light" ? (
                      <MoonIcon size={20} />
                    ) : (
                      <SunIcon size={20} />
                    )}
                  </button>
                  <span className="text-sm flex justify-center text-slate-600 dark:text-slate-300">Theme</span>
                </div>

                {/* Aura Assitant */}
                <div className="flex-1">
                  <NavLink
                    to="/chat"
                    className={({ isActive }) =>
                      `flex mb-1 p-2.5 rounded-full transition-colors ${isActive
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`
                    }
                    title="Chat with AI"
                  >
                    <MessagesSquare size={20} />
                  </NavLink>
                  <span className="text-sm flex justify-center text-slate-600 dark:text-slate-300">Aura</span>
                </div>

                {/* Settings */}
                <div className="flex-1">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex p-2.5 mb-1 rounded-full transition-colors ${isActive
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`
                  }
                  title="Settings"
                >
                  <SettingsIcon size={20} />
                </NavLink>
                  <span className="text-sm flex justify-center text-slate-600 dark:text-slate-300">Settings</span>
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