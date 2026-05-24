import { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MessagesSquare,
  LogOut,
  ChevronLeft,
  Brain,
  MoreHorizontal,
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
  { path: "/knowledge", icon: <Brain size={20} />, label: "Knowledge" },
];

const navLinkClass = (isActive: boolean, isCollapsed: boolean) =>
  isActive
    ? `mx-1 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 px-3.5 py-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all font-bold`
    : `mx-1 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} rounded-full px-3.5 py-2.5 text-text-variant transition-all hover:bg-primary/5 hover:text-primary`;

const sidebarTransition = { type: "spring", stiffness: 200, damping: 25 };

const Sidebar = () => {
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

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mobileNavItems = [
    { path: "/dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
    { path: "/notes", icon: <FileText size={22} />, label: "Notes" },
    { path: "/tasks", icon: <CheckSquare size={22} />, label: "Tasks" },
    { path: "/events", icon: <CalendarIcon size={22} />, label: "Events" },
    { path: "/chat", icon: <MessagesSquare size={22} />, label: "Chat" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
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
          <motion.div
            initial={false}
            animate={{ width: isCollapsed ? "80px" : "224px" }}
            transition={sidebarTransition}
            className="relative flex h-dvh flex-col py-4 glass border-r border-white/10"
            style={{
              boxShadow: "0 0 30px 0 rgba(129,140,248,0.06)",
            }}
          >
            {/* Desktop Collapse Toggle */}
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

            <div className="flex flex-col h-full w-full overflow-hidden">
              <div className={`mb-6 px-4 transition-all duration-300 ${isCollapsed ? "scale-75 items-center justify-center pl-4" : ""}`}>
                <Logo iconOnly iconClassName="h-8 w-8 drop-shadow-md" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 pl-0.5 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase"
                    >
                      AuraOne
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <nav className="flex-1 space-y-1.5 px-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => navLinkClass(isActive, isCollapsed)}
                    title={isCollapsed ? item.label : ""}
                  >
                    {item.icon}
                    <AnimatePresence>
                      {!isCollapsed && (
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
                  className={({ isActive }) => navLinkClass(isActive, isCollapsed)}
                  title={isCollapsed ? "Settings" : ""}
                >
                  <SettingsIcon size={20} />
                  <AnimatePresence>
                    {!isCollapsed && (
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

                <div className={`mx-1 rounded-2xl border border-primary/10 bg-primary/5 p-3 transition-all duration-300 ${isCollapsed ? "px-1.5" : "px-3"}`}>
                  <div className={`flex items-center ${isCollapsed ? "flex-col gap-3 justify-center" : "gap-3"}`}>
                    <Link 
                      to="/settings"
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform cursor-pointer"
                      title={`${userName} (Settings)`}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </Link>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
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
                      className={`flex flex-shrink-0 items-center justify-center rounded-full transition-all hover:bg-red-500/10 hover:text-red-500 group ${isCollapsed ? "p-2" : "p-1.5 text-slate-400"}`}
                      aria-label="Logout"
                    >
                      <LogOut size={isCollapsed ? 18 : 14} className="group-hover:scale-110 transition-transform" />
                      {!isCollapsed && (
                        <span className="ml-2 text-[10px] font-bold hidden group-hover:inline transition-all">SIGN OUT</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-white/10 glass bg-background/80 backdrop-blur-lg px-4 py-2 md:hidden shadow-lg">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMoreMenuOpen(false)}
              className={({ isActive }) => 
                isActive
                  ? "flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-400 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 scale-105"
                  : "flex flex-col items-center justify-center p-2 rounded-xl text-text-variant hover:text-primary transition-all duration-200"
              }
              aria-label={item.label}
            >
              {item.icon}
            </NavLink>
          ))}
          
          {/* More Menu Toggle */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
              moreMenuOpen 
                ? "bg-primary/10 text-primary scale-105" 
                : "text-text-variant hover:text-primary"
            }`}
            aria-label="More Options"
          >
            <MoreHorizontal size={22} />
          </button>
        </div>
      </div>

      {/* Mobile "More" Menu Overlay Popover */}
      <AnimatePresence>
        {moreMenuOpen && (
          <>
            {/* Click-outside backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMoreMenuOpen(false)}
            />
            {/* Popover Card */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl border border-white/10 glass bg-background/95 p-4 shadow-2xl md:hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-sm font-bold text-white shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{userName}</p>
                  <p className="text-[10px] text-text-variant uppercase tracking-wider">Neural Session</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <NavLink
                  to="/knowledge"
                  onClick={() => setMoreMenuOpen(false)}
                  className={({ isActive }) => 
                    isActive
                      ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold"
                      : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-variant hover:bg-primary/5 hover:text-primary transition-all font-medium"
                  }
                >
                  <Brain size={20} />
                  <span className="text-sm">About You</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  onClick={() => setMoreMenuOpen(false)}
                  className={({ isActive }) => 
                    isActive
                      ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold"
                      : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-variant hover:bg-primary/5 hover:text-primary transition-all font-medium"
                  }
                >
                  <SettingsIcon size={20} />
                  <span className="text-sm">Settings</span>
                </NavLink>

                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium text-left"
                >
                  <LogOut size={20} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
