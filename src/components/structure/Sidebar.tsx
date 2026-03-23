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

  const { user, logout } = useAuth();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.name || user.email;
      setUserName(name);
    }
  }, [user]);

  // Logout Logic
  const navigate = useNavigate();
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
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-20 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <button
        className="fixed top-4 left-4 z-30 md:hidden glass p-2 rounded-lg text-primary shadow-lg"
        onClick={toggleSidebar}
      >
        {expanded ? <X size={20} /> : <Menu size={20} />}
      </button>

      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 88 : 256,
          x: expanded ? 0 : -256 
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-y-0 left-0 z-20 glass-panel md:static md:translate-x-0 m-4 rounded-3xl overflow-hidden flex flex-col"
      >
        {/* Header Section */}
        <div className="p-6 flex items-center justify-between border-b border-primary/5">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="header"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-aurora-on-surface truncate">AuraOne</h1>
                  <span className="text-[0.65rem] font-medium uppercase tracking-widest text-primary/60 truncate block">
                    Productivity Hub
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-primary/40 hover:text-primary hover:bg-primary/10 transition-all hidden md:block"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group min-h-[48px] ${
                  isActive
                    ? "nav-item-active"
                    : "text-aurora-on-surface-variant hover:bg-white/60 hover:text-primary"
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 font-medium text-sm truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
          
          <div className="pt-4 pb-2">
            {!isCollapsed && <p className="section-header px-4">AI Interaction</p>}
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-2xl transition-all duration-300 min-h-[48px] ${
                  isActive ? "nav-item-active" : "text-aurora-on-surface-variant hover:bg-white/60 hover:text-primary"
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <MessagesSquare size={22} />
              {!isCollapsed && <span className="ml-4 font-medium text-sm">Aura Assistant</span>}
            </NavLink>
          </div>
        </nav>

        {/* User & Settings Section */}
        <div className="p-4 mt-auto border-t border-primary/5 space-y-2">
          {!isCollapsed && (
            <div className="px-4 py-3 flex items-center gap-3 glass bg-white/40 rounded-2xl mb-4">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs ring-2 ring-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-aurora-on-surface truncate">{userName}</p>
                <p className="text-[0.6rem] text-primary/50 truncate">Premium Plan</p>
              </div>
            </div>
          )}

          <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center justify-between gap-2'} px-2`}>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl text-primary/40 hover:text-primary hover:bg-white/80 transition-all"
              title="Toggle Theme"
            >
              {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>
            
            <NavLink
              to="/settings"
              className="p-3 rounded-2xl text-primary/40 hover:text-primary hover:bg-white/80 transition-all"
              title="Settings"
            >
              <SettingsIcon size={18} />
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl text-error/40 hover:text-error hover:bg-error/10 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};


export default Sidebar;