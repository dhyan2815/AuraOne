// Render the Preferences and Settings page, allowing users to modify account details, update passwords, and track metadata properties.

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, RotateCw, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";

// Define structured properties for displaying account metadata information.
interface UserProfile {
  name: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

const Settings = () => {
  // Access credentials of the current authenticated user context.
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Track profile data, inline name editing flags, new passwords, and loader statuses.
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
    showNew: false,
    showConfirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Synchronize component profile state when authenticated user data changes.
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
        email: user.email || "",
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date(),
      });
      setNewName(user.user_metadata?.name || user.email?.split('@')[0] || "");
    }
  }, [user]);

  // Submit and update the user's name metadata in Supabase authentication stores.
  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    const { error } = await supabase.auth.updateUser({ data: { name: newName.trim() } });
    if (error) {
      toast.error("Process interrupted");
    } else {
      setProfile((prev) => ({ ...prev, name: newName.trim() }));
      setIsEditingName(false);
      toast.success("Identity updated");
    }
  };

  // Perform client validation check and submit new user password values to auth settings.
  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = passwordForm;
    if (!user || !newPassword || !confirmPassword) { toast.error("Complete all protocols"); return; }
    if (newPassword !== confirmPassword) { toast.error("Encryption mismatch"); return; }
    if (newPassword.length < 8) { toast.error("Entropy insufficient (8+ chars)"); return; }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || "Security update failed");
      } else {
        setPasswordForm(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
        toast.success("Security matrix updated");
      }
    } catch {
      toast.error("Security update failed");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Sign out and return to the login page, same flow as the account menu.
  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const passwordMismatch = passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword;

  // Format dates into readable month-day-year formats with 12-hour clock representations.
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);

  return (
    <div className="sec-set">
      <section className="lm-lobe">
        <h1>Settings</h1>
        <p>Profile, security and account for {profile.email || "your account"}.</p>
      </section>

      <div className="lm-lift lm-stagger grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-5">
          {/* Profile */}
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">Profile</h2>
            <div className="grid max-w-[620px] gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-[72px] w-[72px] flex-none place-items-center rounded-full bg-ink text-[28px] font-extrabold text-water">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold">{profile.name}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="lm-field">
                  <label htmlFor="display-name">Name</label>
                  {isEditingName ? (
                    <div className="grid gap-2.5">
                      <input
                        id="display-name"
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="lm-input"
                        placeholder="Enter your name…"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdateName} className="lm-btn lm-btn-sm flex-1">Save name</button>
                        <button onClick={() => setIsEditingName(false)} className="lm-btn lm-btn-soft lm-btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl bg-step px-4 py-[13px]">
                      <span className="truncate">{profile.name}</span>
                      <button onClick={() => setIsEditingName(true)} className="text-sm font-bold underline">Edit</button>
                    </div>
                  )}
                </div>

                <div className="lm-field">
                  <span>Email</span>
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-step px-4 py-[13px]">
                    <span className="truncate">{profile.email}</span>
                    <span className="inline-flex flex-none items-center gap-1 text-sm font-bold text-ink2">
                      <ShieldCheck size={14} /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">Security</h2>
            <div className="grid max-w-[620px] gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="lm-field">
                  <label htmlFor="new-password">New password</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={passwordForm.showNew ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="lm-input pr-12"
                      placeholder="New password…"
                    />
                    <button
                      type="button"
                      aria-label={passwordForm.showNew ? "Hide password" : "Show password"}
                      onClick={() => setPasswordForm(prev => ({ ...prev, showNew: !prev.showNew }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink2 transition-colors hover:text-ink"
                    >
                      {passwordForm.showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="lm-field">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={passwordForm.showConfirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="lm-input pr-12"
                      placeholder="Repeat new password…"
                      aria-invalid={passwordMismatch}
                      aria-describedby={passwordMismatch ? "settings-pw-mismatch" : undefined}
                    />
                    <button
                      type="button"
                      aria-label={passwordForm.showConfirm ? "Hide password" : "Show password"}
                      onClick={() => setPasswordForm(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink2 transition-colors hover:text-ink"
                    >
                      {passwordForm.showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              {passwordMismatch && (
                <p id="settings-pw-mismatch" role="alert" className="text-[15px] font-semibold text-alert">
                  Passwords don't match yet.
                </p>
              )}
              <p className="lm-muted">Use at least 8 characters with a mix of letters and numbers.</p>
              <div>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="lm-btn"
                >
                  {isChangingPassword && <RotateCw className="animate-spin" size={14} />}
                  Update password
                </button>
              </div>
            </div>
          </div>

          {/* Account activity */}
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">Account activity</h2>
            <div className="lm-row"><span className="w-28 flex-none font-bold">Joined</span>{formatDate(profile.createdAt)}</div>
            <div className="lm-row"><span className="w-28 flex-none font-bold">Last sign in</span>{formatDate(profile.lastLogin)}</div>
          </div>

          {/* Account */}
          <div className="rounded-sheet bg-sheet px-6 py-[22px] shadow-[inset_0_0_0_2px_rgb(var(--alert))]">
            <h2 className="mb-1.5 text-[22px] font-bold">Account</h2>
            <p className="mb-3.5">Log out on this device.</p>
            <button onClick={handleLogout} className="lm-btn lm-btn-soft">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>

        {/* ── Right: App Info ── */}
        <div className="grid content-start gap-5">
          <div className="lm-sheet">
            <h2 className="lm-sheet-title">About AuraOne</h2>
            <p className="lm-muted mb-3.5">Version 1.2.0</p>
            <p className="mb-4 text-ink2">
              A modern productivity platform built to enhance your workflow, combining tasks, notes, and AI-powered assistance.
            </p>
            {[
              { name: 'AI Assistant', path: '/chat' },
              { name: 'Smart Notes', path: '/notes' },
              { name: 'Task Management', path: '/tasks' },
              { name: 'Calendar & Events', path: '/events' },
              { name: 'Cloud Sync', path: null }
            ].map(f => (
              f.path ? (
                <Link to={f.path} key={f.name} className="lm-row lm-row-link font-semibold">
                  {f.name}
                  <ChevronRight size={16} className="ml-auto text-ink2" />
                </Link>
              ) : (
                <div key={f.name} className="lm-row font-semibold text-ink2">{f.name}</div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
