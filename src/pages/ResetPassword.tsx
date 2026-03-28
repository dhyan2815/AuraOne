import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, ShieldCheck, RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/structure/Logo";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Recovery state acknowledged
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Parity mismatch");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Entropy too low (min 6 chars)");
      return;
    }

    setIsResetting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message || "Key update failed");
    } else {
      setResetSuccess(true);
      toast.success("Neural key re-encrypted");
    }
    setIsResetting(false);
  };

  return (
    <div className="login min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-white">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-panel p-12 rounded-[3.5rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-10">
          {/* Logo */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Logo iconOnly iconClassName="w-16 h-16 drop-shadow-xl p-3" />
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-aurora-on-surface tracking-tighter">Key Re-encryption</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Secure Access Protocol</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!resetSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
                className="space-y-8"
                autoComplete="off"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-4">New Encryption Key</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="input-aurora w-full pl-14 pr-12 py-4 text-sm font-bold"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary/30 hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-4">Parity Confirmation</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="input-aurora w-full pl-14 pr-12 py-4 text-sm font-bold"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary/30 hover:text-primary transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-aurora-primary w-full py-5 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  disabled={isResetting}
                >
                  {isResetting ? <RotateCw className="animate-spin" size={18} /> : <div className="aurora-glow"><ShieldCheck size={18} /></div>}
                  {isResetting ? "Updating Key..." : "Finalize Re-encryption"}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-10"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-[2rem] glass border border-success/20 flex items-center justify-center text-success">
                    <CheckCircle size={40} className="aurora-glow" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-aurora-on-surface tracking-tight">Key Applied Successfully</h2>
                  <p className="text-sm font-medium text-aurora-on-surface-variant leading-relaxed">
                    Your neural encryption key has been updated across the matrix.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="btn-aurora-primary w-full py-5 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20"
                >
                  Go to Matrix
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Credit */}
        <div className="mt-8 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/30">AuraOne Security Interface</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;