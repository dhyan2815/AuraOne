import { useState, useEffect } from "react";
import { User, Info, Eye, EyeOff, ShieldCheck, Zap, History, RotateCw, Key, Shield, ChevronRight } from "lucide-react";
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
      toast.error("Process interrupted");
    } else {
      setProfile((prev) => ({ ...prev, name: newName.trim() }));
      setIsEditingName(false);
      toast.success("Identity updated");
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword || !confirmPassword) { toast.error("Complete all protocols"); return; }
    if (newPassword !== confirmPassword) { toast.error("Encryption mismatch"); return; }
    if (newPassword.length < 8) { toast.error("Entropy insufficient (8+ chars)"); return; }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || "Security update failed");
      } else {
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Security matrix updated");
      }
    } catch (err) {
      toast.error("Security update failed");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);

  return (
    <div className="app-page-tight space-y-8">
      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <Logo iconOnly iconClassName="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h1>
        <p className="text-sm text-text-variant mt-1 font-medium italic opacity-60">Manage your profile information and account security.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Main Settings ── */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Profile Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-[2.5rem] p-6 lg:p-10 transition-colors duration-500 shadow-2xl shadow-primary/5 border border-primary/5"
          >
            <div className="flex items-center gap-5 mb-10 pb-6 border-b border-primary/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <User size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">User Profile</h2>
                <p className="text-[10px] text-text-variant font-black uppercase tracking-[0.2em] opacity-60">Your personal account details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                {/* Display Name */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-variant opacity-60 ml-1">Display Name</label>
                  {isEditingName ? (
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="input-aurora py-4 px-6"
                        placeholder="Enter your name…"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdateName} className="btn-aurora flex-1 py-3 text-[10px]">Save Name</button>
                        <button onClick={() => setIsEditingName(false)} className="glass border-primary/10 px-6 py-3 rounded-2xl text-[10px] font-black text-text-variant hover:text-text transition-colors">Abuse</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between glass border-primary/5 p-5 rounded-2xl group transition-all hover:border-primary/20">
                      <span className="text-base font-bold text-text">{profile.name}</span>
                      <button onClick={() => setIsEditingName(true)} className="text-[10px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-all hover:scale-110">Reconfigure</button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-variant opacity-60 ml-1">Email Address</label>
                  <div className="glass border-primary/5 p-5 rounded-2xl flex flex-col gap-2">
                    <span className="text-sm font-bold text-text-variant italic">{profile.email}</span>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-variant opacity-60 ml-1">Account Activity</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 glass border-primary/5 p-4 rounded-2xl transition-all hover:bg-primary/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                      <Zap size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-variant opacity-50">Joined On</p>
                      <p className="text-xs font-bold text-text">{formatDate(profile.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 glass border-primary/5 p-4 rounded-2xl transition-all hover:bg-primary/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                      <History size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-variant opacity-50">Last Sign In</p>
                      <p className="text-xs font-bold text-text">{formatDate(profile.lastLogin)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-[2.5rem] p-6 lg:p-10 transition-colors duration-500 shadow-2xl shadow-primary/5 border border-primary/5"
          >
            <div className="flex items-center gap-5 mb-10 pb-6 border-b border-primary/5">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                <Key size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Security & Password</h2>
                <p className="text-[10px] text-text-variant font-black uppercase tracking-[0.2em] opacity-60">Manage your account access</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-variant opacity-60 ml-1">New Access Key</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full input-aurora py-4 px-6 pr-14"
                      placeholder="New password…"
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-text-variant hover:text-primary transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-variant opacity-60 ml-1">Confirm Protocol</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full input-aurora py-4 px-6 pr-14"
                      placeholder="Repeat new password…"
                    />
                    <button
                      onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-text-variant hover:text-primary transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-6">
                <div className="glass p-5 rounded-2xl border-primary/5 bg-primary/5">
                    <p className="text-[10px] font-bold text-text-variant leading-relaxed">Ensure a minimum of 8 characters with alphanumeric variety to optimize encryption against brute-force intrusion.</p>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="btn-aurora w-full py-3 text-[10px] tracking-[0.2em] shadow-xl shadow-secondary/20 bg-gradient-to-r from-secondary to-primary uppercase flex items-center justify-center gap-2 rounded-2xl"
                >
                  {isChangingPassword ? <RotateCw className="animate-spin" size={14} /> : <Shield size={14} strokeWidth={3} />}
                  Update Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right: App Info ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass rounded-[2.5rem] p-8 sticky top-8 border border-primary/5 transition-colors duration-500 shadow-2xl shadow-primary/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text mb-8 flex items-center gap-3">
              <Info size={16} className="text-primary" strokeWidth={2.5} /> About AuraOne
            </h3>

            <div className="flex items-center gap-5 mb-10 group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 glass p-3 border border-primary/10 group-hover:rotate-6 transition-transform">
                <Logo iconOnly iconClassName="w-full h-full" />
              </div>
              <div>
                <Logo textOnly textClassName="text-sm" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mt-1">Version 1.2.0</p>
              </div>
            </div>

            <p className="text-xs text-text-variant leading-relaxed mb-8 font-medium">
              A modern productivity platform built to enhance your workflow, combining tasks, notes, and AI-powered assistance.
            </p>

            <div className="space-y-3">
              {[
                'Neural Pulse AI',
                'Cloud Archive Sync',
                'Aurora Glass Interface',
                'Layer-2 Encryption'
              ].map(f => (
                <div key={f} className="flex items-center justify-between glass border-primary/5 px-4 py-3.5 rounded-2xl hover:bg-primary/5 transition-all group">
                  <span className="text-[10px] font-black text-text uppercase tracking-widest">{f}</span>
                  <ChevronRight size={12} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-primary/5 text-center">
              <p className="text-[9px] font-black text-text-variant uppercase tracking-[0.4em] opacity-40">Designed for Productivity</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
