//App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/structure/Layout";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import NotePage from "./pages/NotePage";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Loader from "./components/ui/Loader";
import Chat from "./pages/Chat";
import SignUp from "./pages/SignUp";

function App() {

  // Loader is displayed when logging..
  const { user, loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/signup" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notes/:id" element={<NotePage />} />
            <Route path="tasks" element={<Tasks />} />
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