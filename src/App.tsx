// Configure the global routing tree structure, handling user authentication gates, layout templates, and wildcard route redirects.

import { ComponentType, lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/structure/Layout";
import Loader from "./components/ui/Loader";
import { useAuth } from "./hooks/useAuth";

// After a redeploy, an open tab can ask for route chunks that no longer exist (Vercel answers with index.html).
// Reload once so the tab picks up the new build; the timestamp guard stops a broken build from looping.
const reloadForNewBuild = () => {
  try {
    const last = Number(sessionStorage.getItem("chunk-reload-at") ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem("chunk-reload-at", String(Date.now()));
  } catch {
    return; // No storage means no loop guard, so don't reload.
  }
  window.location.reload();
};

// Lazy route page that reloads on a failed load. Only navigation goes through here, so a failed background prefetch never reloads.
const page = <T extends ComponentType>(load: () => Promise<{ default: T }>) =>
  lazy(() => load().catch((error) => { reloadForNewBuild(); throw error; }));

// Route pages are split into their own chunks so each visitor downloads only the screens they open.
const loadDashboard = () => import("./pages/Dashboard");
const loadNotes = () => import("./pages/Notes");
const loadNotePage = () => import("./pages/NotePage");
const loadTasks = () => import("./pages/Tasks");
const loadTaskPage = () => import("./pages/TaskPage");
const loadCalendar = () => import("./pages/Calendar");
const loadChat = () => import("./pages/Chat");
const loadKnowledgeBase = () => import("./pages/KnowledgeBase");
const loadSettings = () => import("./pages/Settings");

const LandingPage = page(() => import("./pages/LandingPage"));
const Login = page(() => import("./pages/Login"));
const SignUp = page(() => import("./pages/SignUp"));
const ForgotPassword = page(() => import("./pages/ForgotPassword"));
const ResetPassword = page(() => import("./pages/ResetPassword"));
const Dashboard = page(loadDashboard);
const Notes = page(loadNotes);
const NotePage = page(loadNotePage);
const Tasks = page(loadTasks);
const TaskPage = page(loadTaskPage);
const Calendar = page(loadCalendar);
const Chat = page(loadChat);
const KnowledgeBase = page(loadKnowledgeBase);
const Settings = page(loadSettings);

// Signed-in screens, warmed in the background once the first page has rendered.
const appPages = [
  loadDashboard, loadTasks, loadNotes, loadCalendar, loadChat,
  loadTaskPage, loadNotePage, loadKnowledgeBase, loadSettings,
];

function App() {
  // Check the global user authentication context status.
  const { user, loading } = useAuth();

  // Prefetch signed-in route chunks when the browser is idle so section switches don't wait on the network.
  useEffect(() => {
    if (!user) return;
    const prefetch = () => appPages.forEach((load) => load().catch(() => {}));
    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(prefetch, { timeout: 4000 }) : window.setTimeout(prefetch, 2000);
    return () => (idle ? window.cancelIdleCallback(handle) : window.clearTimeout(handle));
  }, [user]);

  // Render a full-screen loading spinner while the auth session loads.
  if (loading) return <Loader />;

  return (
    // Public pages suspend here; signed-in pages suspend inside Layout so the top bar stays visible.
    <Suspense fallback={<Loader />}>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notes/:id" element={<NotePage />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskPage />} />
            <Route path="events" element={<Calendar />} />
            <Route path="chat" element={<Chat />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        )}
      </Routes>
    </Suspense>
  );
}

export default App;
