import { useState } from "react";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, Sparkles, RotateCw, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Failed to send reset link");
    } else {
      setEmailSent(true);
      toast.success("Reset link dispatched");
    }

    setIsSending(false);
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
            <div className="w-16 h-16 rounded-[1.5rem] glass border border-primary/10 flex items-center justify-center text-primary relative group">
              <Sparkles size={32} className="aurora-glow group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-aurora-on-surface tracking-tighter">Neural Recovery</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Access Restoration Protocol</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!emailSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-aurora-on-surface-variant leading-relaxed px-4">
                    Enter your registered neural link (email) to receive a cryptographic reset sequence.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-8">
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-4">
                      Neural Link (Email)
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        id="email"
                        type="email"
                        placeholder="identity@matrix.io"
                        className="input-aurora w-full pl-14 pr-6 py-4 text-sm font-bold"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-aurora-primary w-full py-5 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 group"
                    disabled={isSending}
                  >
                    {isSending ? <RotateCw className="animate-spin" size={18} /> : <ShieldAlert size={18} className="group-hover:rotate-12 transition-transform" />}
                    {isSending ? "Dispatching..." : "Dispatch Reset Sequence"}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-[2rem] glass border border-success/20 flex items-center justify-center text-success relative">
                    <CheckCircle size={40} className="aurora-glow" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-aurora-on-surface tracking-tight">Sequence Dispatched</h2>
                  <p className="text-sm font-medium text-aurora-on-surface-variant leading-relaxed">
                    Check your neural inbox. We've sent a cryptographic link to <strong className="text-primary">{email}</strong>
                  </p>
                </div>

                <div className="glass p-6 rounded-[2rem] border border-primary/5 bg-primary/5 text-center space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">No transmission detected?</p>
                   <p className="text-[9px] font-bold text-aurora-on-surface-variant/40 leading-relaxed uppercase">Check junk sectors or re-establish sync below.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="btn-aurora-primary w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/10"
                  >
                    Resync Transmission
                  </button>
                  
                  <Link
                    to="/login"
                    className="block w-full py-4 rounded-[1.5rem] glass border border-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface hover:bg-white/40 transition-all text-center"
                  >
                    Back to Matrix
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Credit */}
        <div className="mt-8 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/30">AuraOne Recovery Interface</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;