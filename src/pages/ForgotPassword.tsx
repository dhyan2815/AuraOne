// Render the ForgotPassword recovery interface, allowing users to enter email addresses and trigger reset links via Supabase.

import { useState } from "react";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";
import { RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../components/structure/AuthLayout";

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
    <AuthLayout variant="centered" color="events" blob="tl">
      <div className="grid gap-4 rounded-[36px] bg-sheet p-8 sm:p-11">
        <h1 className="lm-display text-5xl">Forgot your password?</h1>

        <AnimatePresence mode="wait">
          {!emailSent ? (
            <motion.form
              key="form"
              onSubmit={handleResetPassword}
              aria-label="Reset your password"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid gap-4"
            >
              <p>Enter your account email and we'll send a link to choose a new one.</p>
              <label htmlFor="email" className="lm-field">
                Email
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="lm-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <button type="submit" className="lm-btn w-full !py-[15px]" disabled={isSending}>
                {isSending && <RotateCw className="animate-spin" size={16} />}
                {isSending ? "Sending…" : "Send reset link"}
              </button>
              <Link to="/login" className="font-semibold underline">Back to log in</Link>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              <p role="status" className="rounded-[20px] bg-today px-[18px] py-3.5 font-semibold text-[#1F211E]">
                Link sent to {email}. Check your inbox and junk folder.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="lm-btn lm-btn-soft w-full !py-[15px]"
              >
                Send again
              </button>
              <Link to="/login" className="font-semibold underline">Back to log in</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
