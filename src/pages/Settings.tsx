import { useState, useEffect } from "react";
import { User, Info, Eye, EyeOff, ShieldCheck, Zap, History, RotateCw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Logo from "../components/structure/Logo";

interface UserProfile {
  name: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    const { error } = await supabase.auth.updateUser({ data: { name: newName.trim() } });
    if (error) {
      toast.error("Update failed");
    } else {
      setProfile((prev) => ({ ...prev, name: newName.trim() }));
      setIsEditingName(false);
      toast.success("Name updated");
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword || !confirmPassword) { toast.error("Fill in all fields"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }

    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message || "Password update failed");
    } else {
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    }
    setIsChangingPassword(false);
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);

  const glassCard = "bg-white/30 backdrop-blur-[40px] border border-white/30 rounded-2xl p-6 shadow-xl shadow-indigo-500/5";

  return (
    <div className="app-page-tight space-y-6">
      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-1">
          <Logo iconOnly iconClassName="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: Main Settings ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile Card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className={glassCard}
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/20">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Profile</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Manage your identity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Display Name</label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-white/60 border border-white/40 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <button onClick={handleUpdateName} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">Save</button>
                      <button onClick={() => setIsEditingName(false)} className="bg-white/60 border border-white/40 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-white/80 transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white/40 border border-white/30 p-3 rounded-xl group">
                      <span className="text-sm font-semibold text-slate-700">{profile.name}</span>
                      <button onClick={() => setIsEditingName(true)} className="text-[10px] font-bold uppercase text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">Edit</button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="bg-white/40 border border-white/30 p-3 rounded-xl flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-500">{profile.email}</span>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={11} className="text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Info</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-white/30 border border-white/20 p-3 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <Zap size={13} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Joined</p>
                      <p className="text-xs font-semibold text-slate-700">{formatDate(profile.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/30 border border-white/20 p-3 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <History size={13} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Last Sign In</p>
                      <p className="text-xs font-semibold text-slate-700">{formatDate(profile.lastLogin)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={glassCard}
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/20">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Security</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Change your password</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="••••••••"
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/60 border border-white/40 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="••••••••"
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? <RotateCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                  Update Password
                </button>
                <p className="text-[9px] text-slate-400 mt-2 text-center">Must be at least 6 characters.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right: App Info ── */}
        <div className="lg:col-span-1">
          <div className={`${glassCard} sticky top-4`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2 mb-4">
              <Info size={14} className="text-indigo-500" /> About
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <Logo iconOnly iconClassName="w-10 h-10 drop-shadow-sm" />
              <div>
                <Logo textOnly textClassName="text-xs" />
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">v1.2.0 · Stable</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              A modern productivity platform with AI assistance, rich-text notes, and smart task management.
            </p>

            <div className="space-y-1.5">
              {[
                'AI Assistance',
                'Cloud Sync',
                'Aurora Glass UI',
                'End-to-End Encryption'
              ].map(f => (
                <div key={f} className="flex items-center justify-between bg-white/30 border border-white/20 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] font-semibold text-slate-600">{f}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Built with Aurora Glass</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
