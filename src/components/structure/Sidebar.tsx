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

const navItems = [
  { path: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { path: "/notes", icon: <FileText size={20} />, label: "Notes" },
  { path: "/tasks", icon: <CheckSquare size={20} />, label: "Tasks" },
  { path: "/events", icon: <CalendarIcon size={20} />, label: "Events" },
  { path: "/chat", icon: <MessagesSquare size={20} />, label: "Chat" },
];

const navLinkClass = (isActive: boolean) =>
  isActive
    ? "mx-1 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 px-3.5 py-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all font-bold"
    : "mx-1 flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-text-variant transition-all hover:bg-primary/5 hover:text-primary";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
      setUserName(name);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div
      className="relative flex h-dvh w-56 flex-col overflow-hidden py-4 glass border-r border-white/10"
      style={{
        boxShadow: "0 0 30px 0 rgba(129,140,248,0.06)",
      }}
    >

      <div className="mb-4 px-4">
        <Logo iconClassName="h-8 w-8 drop-shadow-md" textClassName="text-xl" />
        <p className="mt-1 pl-0.5 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
          The Luminous Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            {item.icon}
            <span className="text-sm font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3">
        <NavLink to="/settings" className={({ isActive }) => navLinkClass(isActive)}>
          <SettingsIcon size={20} />
          <span className="text-sm font-semibold">Settings</span>
        </NavLink>

        <div className="mx-1 mt-4 rounded-2xl border border-primary/10 bg-primary/5 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-xs font-bold text-white shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{userName}</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Workspace account</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex-shrink-0 rounded-full p-1 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              aria-label="Logout"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed left-4 top-3 z-50 rounded-xl border border-white/30 bg-white/70 p-2 text-indigo-600 shadow-md backdrop-blur-sm md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className="hidden w-56 flex-shrink-0 md:block">
        <div className="fixed bottom-0 left-0 top-0 z-20 w-56">
          <SidebarContent />
        </div>
      </aside>

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
