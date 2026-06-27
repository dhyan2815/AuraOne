// Render the ForgotPassword recovery interface, allowing users to enter email addresses and trigger reset links via Supabase.

import { useState } from "react";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, RotateCw, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/structure/Logo";

const ForgotPassword = () => {
  // Track recovery email inputs, active loader flags, and delivery verification toggles.
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Dispatch a password reset link to the configured email and specify redirect parameters.
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
    <div className="login min-h-screen text-aurora-on-surface flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Animated Gradient Mesh */}
      <div className="aurora-mesh fixed inset-0 z-[-1]" aria-hidden="true" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10 mx-auto"
      >
        <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Logo iconOnly iconClassName="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-xl p-2.5 sm:p-3" />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-aurora-on-surface tracking-tighter">Neural Recovery</h1>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Access Restoration Protocol</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!emailSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-aurora-on-surface-variant leading-relaxed px-2 sm:px-4">
                    Enter your registered neural link (email) to receive a cryptographic reset sequence.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-2">
                      Neural Link (Email)
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        id="email"
                        type="email"
                        placeholder="identity@matrix.io"
                        className="input-aurora w-full pl-14 pr-6 py-3.5 text-xs sm:text-sm font-bold"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-aurora-primary w-full py-3.5 sm:py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 group"
                    disabled={isSending}
                  >
                    {isSending ? <RotateCw className="animate-spin" size={16} /> : <ShieldAlert size={16} className="group-hover:rotate-12 transition-transform" />}
                    {isSending ? "Dispatching..." : "Dispatch Reset Sequence"}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors group"
                  >
                    <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 sm:space-y-8"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] glass border border-success/20 flex items-center justify-center text-success relative">
                    <CheckCircle size={32} className="aurora-glow sm:w-[40px] sm:h-[40px]" />
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-xl sm:text-2xl font-black text-aurora-on-surface tracking-tight">Sequence Dispatched</h2>
                  <p className="text-xs sm:text-sm font-medium text-aurora-on-surface-variant leading-relaxed">
                    Check your neural inbox. We've sent a cryptographic link to <strong className="text-primary">{email}</strong>
                  </p>
                </div>

                <div className="glass p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-primary/5 bg-primary/5 text-center space-y-1">
                   <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60">No transmission detected?</p>
                   <p className="text-[8px] sm:text-[9px] font-bold text-aurora-on-surface-variant/40 leading-relaxed uppercase">Check junk sectors or re-establish sync below.</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="btn-aurora-primary w-full py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/10"
                  >
                    Resync Transmission
                  </button>
                  
                  <Link
                    to="/login"
                    className="block w-full py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] glass border border-primary/10 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-aurora-on-surface hover:bg-primary/5 transition-all text-center"
                  >
                    Back to Matrix
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Credit */}
        <div className="mt-6 sm:mt-8 text-center">
           <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.5em] text-primary/30">AuraOne Recovery Interface</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;