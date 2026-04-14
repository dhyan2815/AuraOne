import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MessagesSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Logo from "./Logo";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  useEffect(() => {
    if (user) {
      const name =
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";
      setUserName(name);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/notes",     icon: <FileText size={20} />,         label: "Notes" },
    { path: "/tasks",     icon: <CheckSquare size={20} />,      label: "Tasks" },
    { path: "/events",    icon: <CalendarIcon size={20} />,     label: "Events" },
    { path: "/chat",      icon: <MessagesSquare size={20} />,   label: "Aura AI Chat" },
  ];

  const SidebarContent = () => (
    <div className="relative flex h-dvh w-64 flex-col overflow-hidden py-4 space-y-1"
      style={{
        background: "rgba(255,255,255,0.20)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRight: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 0 30px 0 rgba(129,140,248,0.08)",
      }}>

      {/* Brand */}
      <div className="px-4 mb-4">
        <Logo 
          iconClassName="w-8 h-8 drop-shadow-md"
          textClassName="text-xl"
        />
        <p className="text-[10px] font-medium tracking-wide text-slate-500 mt-1 pl-0.5">
          The Luminous Workspace
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 to-purple-400 text-white rounded-full mx-1 px-3.5 py-2.5 shadow-lg shadow-indigo-200/50 transition-all"
                : "flex items-center gap-2.5 text-slate-600 hover:text-indigo-600 hover:bg-white/40 rounded-full px-3.5 py-2.5 mx-1 transition-all"
            }
          >
            {item.icon}
            <span className="text-sm font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 to-purple-400 text-white rounded-full mx-1 px-3.5 py-2.5 shadow-lg shadow-indigo-200/50 transition-all"
              : "flex items-center gap-2.5 text-slate-600 hover:text-indigo-600 hover:bg-white/40 rounded-full px-3.5 py-2.5 mx-1 transition-all"
          }
        >
          <SettingsIcon size={20} />
          <span className="text-sm font-semibold">Settings</span>
        </NavLink>

        {/* User Profile Card */}
        <div className="mt-3 mx-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-white/20"
          style={{ background: "rgba(255,255,255,0.30)" }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-slate-800">{userName}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Premium</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-3 z-50 rounded-xl border border-white/30 bg-white/70 p-2 text-indigo-600 shadow-md backdrop-blur-sm md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:block flex-shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 md:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
