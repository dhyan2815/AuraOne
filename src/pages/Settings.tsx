import { useState, useEffect } from "react";
import { User, Info, Eye, EyeOff, Sparkles, ShieldCheck, Zap, History, Globe, RotateCw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || user.email?.split('@')[0] || "Neural Entity",
        email: user.email || "",
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date(),
      });
      setNewName(user.user_metadata?.name || user.email?.split('@')[0] || "");
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    const { error } = await supabase.auth.updateUser({
      data: { name: newName.trim() },
    });

    if (error) {
      toast.error("Protocol update failed");
    } else {
      setProfile((prev) => ({ ...prev, name: newName.trim() }));
      setIsEditingName(false);
      toast.success("Identity established");
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword || !confirmPassword) {
      toast.error("Encryption fields incomplete");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Parity mismatch");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Entropy too low (min 6 chars)");
      return;
    }

    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message || "Encryption update failed");
    } else {
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Neural key re-encrypted");
    }
    setIsChangingPassword(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={16} className="aurora-glow" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Configuration</span>
        </div>
        <h1 className="text-5xl font-black text-aurora-on-surface tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel p-10 rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-8"
          >
            <div className="flex items-center gap-4 py-2 border-b border-primary/5">
               <div className="w-12 h-12 rounded-2xl glass border border-primary/10 flex items-center justify-center text-primary">
                 <User size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-aurora-on-surface">Neural Identity</h2>
                  <p className="text-[10px] font-bold text-aurora-on-surface-variant uppercase tracking-widest opacity-60">Manage your presence in the matrix</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-2">Display Designation</label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="input-aurora flex-1 py-3 px-6 text-sm font-bold"
                      />
                      <button onClick={handleUpdateName} className="btn-aurora-primary px-6 text-[10px] font-black uppercase">Commit</button>
                      <button onClick={() => setIsEditingName(false)} className="glass px-4 rounded-2xl border border-primary/10 text-[10px] font-black uppercase">Abort</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between glass p-4 rounded-2xl border border-primary/5 group">
                      <span className="text-sm font-black text-aurora-on-surface">{profile.name}</span>
                      <button onClick={() => setIsEditingName(true)} className="text-[10px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-all">Relocalize</button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-2">Communication Link</label>
                  <div className="glass p-4 rounded-2xl border border-primary/5 flex flex-col gap-1">
                    <span className="text-sm font-black text-aurora-on-surface opacity-40">{profile.email}</span>
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={12} className="text-success" />
                       <span className="text-[8px] font-bold text-success uppercase tracking-widest">Permanent Encryption Link</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-2">Temporal Markers</label>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl glass border border-primary/5 flex items-center justify-center text-primary/30">
                            <Zap size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-aurora-on-surface-variant/40">Established</p>
                            <p className="text-[10px] font-black text-aurora-on-surface">{formatDate(profile.createdAt)}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl glass border border-primary/5 flex items-center justify-center text-primary/30">
                            <History size={14} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-aurora-on-surface-variant/40">Last Synced</p>
                            <p className="text-[10px] font-black text-aurora-on-surface">{formatDate(profile.lastLogin)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-10 rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-8"
          >
            <div className="flex items-center gap-4 py-2 border-b border-primary/5">
               <div className="w-12 h-12 rounded-2xl glass border border-primary/10 flex items-center justify-center text-error">
                 <ShieldCheck size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-aurora-on-surface">Access Security</h2>
                  <p className="text-[10px] font-bold text-aurora-on-surface-variant uppercase tracking-widest opacity-60">Update your neural encryption keys</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-2">New Encryption Key</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-aurora w-full py-3 px-6 pr-12 text-sm font-bold"
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowPasswords(p => ({...p, new: !p.new}))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary transition-colors"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-2">Parity Confirmation</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-aurora w-full py-3 px-6 pr-12 text-sm font-bold"
                        placeholder="••••••••"
                      />
                      <button
                         onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
               </div>
               <div className="flex flex-col justify-end pb-1">
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                    className="btn-aurora-primary w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isChangingPassword ? <RotateCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    Apply New Encryption
                  </button>
               </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-[3rem] border border-primary/5 sticky top-8 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-aurora-on-surface flex items-center gap-3">
              <Info size={16} className="text-primary" /> Architecture
            </h3>

            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.5rem] glass border border-primary/10 flex items-center justify-center">
                    <Globe size={20} className="text-primary/60" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-aurora-on-surface uppercase tracking-widest">AuraOne Core Edition</h4>
                    <p className="text-[10px] font-bold text-aurora-on-surface-variant opacity-40 uppercase">v1.2.0-STABLE</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[11px] font-medium text-aurora-on-surface-variant leading-relaxed opacity-70">
                    AuraOne is an advanced productivity matrix integrating neural task management, rich-text archives, and bioluminescent temporal tracking.
                  </p>

                  <div className="space-y-3">
                     {[
                       { label: 'Neural Assistance', active: true },
                       { label: 'Cloud Synchrony', active: true },
                       { label: 'Aurora Glass Interface', active: true },
                       { label: 'End-to-End Encryption', active: true }
                     ].map(f => (
                       <div key={f.label} className="flex items-center justify-between glass px-4 py-2 rounded-xl border border-primary/5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-aurora-on-surface-variant opacity-60">{f.label}</span>
                          <div className="w-1 h-1 rounded-full bg-success aurora-glow" />
                       </div>
                     ))}
                  </div>
               </div>

               <div className="pt-6 border-t border-primary/5 text-center">
                  <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Optimized by Aurora Glass</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
