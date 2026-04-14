import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MessagesSquare,
  Power,
  Menu,
  X,
  ChevronLeft,
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

const navLinkClass = (isActive: boolean, isCollapsed: boolean) =>
  isActive
    ? `mx-1 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 px-3.5 py-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all font-bold`
    : `mx-1 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} rounded-full px-3.5 py-2.5 text-text-variant transition-all hover:bg-primary/5 hover:text-primary`;

const sidebarTransition = { type: "spring", stiffness: 200, damping: 25 };

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed.toString());
  }, [isCollapsed]);

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

  const SidebarContent = ({ isMobile = false }) => (
    <motion.div
      initial={false}
      animate={{ width: isMobile ? "240px" : isCollapsed ? "80px" : "224px" }}
      transition={sidebarTransition}
      className="relative flex h-dvh flex-col py-4 glass border-r border-white/10"
      style={{
        boxShadow: "0 0 30px 0 rgba(129,140,248,0.06)",
      }}
    >
      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[106px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-background shadow-md transition-all hover:scale-110 hover:bg-primary/10 hover:text-primary active:scale-95 text-text"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={14} />
          </motion.div>
        </button>
      )}

      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className={`mb-6 px-4 transition-all duration-300 ${isCollapsed && !isMobile ? "scale-75 items-center justify-center pl-4" : ""}`}>
        <Logo 
          iconClassName="h-8 w-8 drop-shadow-md" 
          textClassName={`text-xl transition-opacity duration-300 ${isCollapsed && !isMobile ? "hidden" : "block"}`} 
        />
        <AnimatePresence>
          {(!isCollapsed || isMobile) && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 pl-0.5 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase"
            >
              The Luminous Workspace
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) => navLinkClass(isActive, isCollapsed && !isMobile)}
            title={isCollapsed && !isMobile ? item.label : ""}
          >
            {item.icon}
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-semibold truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 space-y-4">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => navLinkClass(isActive, isCollapsed && !isMobile)}
          title={isCollapsed && !isMobile ? "Settings" : ""}
        >
          <SettingsIcon size={20} />
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-semibold"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <div className={`mx-1 rounded-2xl border border-primary/10 bg-primary/5 p-3 transition-all duration-300 ${isCollapsed && !isMobile ? "px-1.5" : "px-3"}`}>
          <div className={`flex items-center ${isCollapsed && !isMobile ? "flex-col gap-3 justify-center" : "gap-3"}`}>
            <div 
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-xs font-bold text-white shadow-md"
              title={userName}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{userName}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`flex flex-shrink-0 items-center justify-center rounded-full transition-all hover:bg-red-500/10 hover:text-red-500 group ${isCollapsed && !isMobile ? "p-2" : "p-1.5 text-slate-400"}`}
              aria-label="Logout"
            >
              <Power size={isCollapsed && !isMobile ? 18 : 14} className="group-hover:scale-110 transition-transform" />
              {(!isCollapsed || isMobile) && (
                <span className="ml-2 text-[10px] font-bold hidden group-hover:inline transition-all">SIGN OUT</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
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

      <motion.aside 
        className="hidden flex-shrink-0 md:block" 
        animate={{ width: isCollapsed ? "80px" : "224px" }}
        transition={sidebarTransition}
      >
        <motion.div 
          className="fixed bottom-0 left-0 top-0 z-20" 
          animate={{ width: isCollapsed ? "80px" : "224px" }}
          transition={sidebarTransition}
        >
          <SidebarContent />
        </motion.div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 md:hidden"
          >
            <SidebarContent isMobile />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
