//App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/structure/Layout";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import NotePage from "./pages/NotePage";
import Tasks from "./pages/Tasks";
import TaskPage from "./pages/TaskPage";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Loader from "./components/ui/Loader";
import Chat from "./pages/Chat";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import EmailVerificationHandler from "./pages/EmailVerificationHandler";

function App() {

  // Loader is displayed when logging..
  const { user, loading, isEmailVerified } = useAuth();
  if (loading) return <Loader />;

  return (
    <>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerificationHandler />} />
            <Route path="*" element={<Navigate to="/signup" replace />} />
          </>
        ) : !isEmailVerified ? (
          <>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email/confirm" element={<EmailVerificationHandler />} />
            <Route path="*" element={<Navigate to="/verify-email" replace />} />
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
            <Route path="settings" element={<Settings />} />
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;