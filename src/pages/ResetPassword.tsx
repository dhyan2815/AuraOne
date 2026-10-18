// Render the ResetPassword interface, allowing verified recovery users to re-encrypt and update their password credentials.

import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../components/structure/AuthLayout";

const ResetPassword = () => {
  // Track routing navigation functions and credential property forms.
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Monitor authorization state events on mounting to confirm password recovery session triggers.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Recovery event context acknowledged by Supabase auth.
      }
    });
    
    // Tear down authentication state changes subscription channel on unmount.
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Validate passwords equality metrics and submit the update query to Supabase.
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

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <AuthLayout variant="centered" color="know" blob="br">
      <div className="grid gap-4 rounded-[36px] bg-sheet p-8 sm:p-11">
        <AnimatePresence mode="wait">
          {!resetSuccess ? (
            <motion.form
              key="form"
              onSubmit={handleResetPassword}
              aria-label="Choose a new password"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid gap-4"
              autoComplete="off"
            >
              <h1 className="lm-display text-5xl">Choose a new password</h1>
              <p>At least 6 characters. You'll be able to log in right after.</p>

              <div className="lm-field">
                <label htmlFor="new-password">New password</label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="lm-input pr-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink2 transition-colors hover:text-ink"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="lm-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="lm-input pr-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    aria-invalid={mismatch}
                    aria-describedby={mismatch ? "pw-mismatch" : undefined}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink2 transition-colors hover:text-ink"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {mismatch && (
                <p id="pw-mismatch" role="alert" className="text-[15px] font-semibold text-alert">
                  Passwords don't match yet.
                </p>
              )}

              <button type="submit" className="lm-btn w-full !py-[15px]" disabled={isResetting}>
                {isResetting && <RotateCw className="animate-spin" size={16} />}
                {isResetting ? "Updating…" : "Update password"}
              </button>
              <Link to="/login" viewTransition className="font-semibold underline">Back to log in</Link>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
            >
              <h1 className="lm-display text-5xl">Password updated</h1>
              <p role="status" className="rounded-[20px] bg-today px-[18px] py-3.5 font-semibold text-[#1F211E]">
                Your password has been changed.
              </p>
              <button onClick={() => navigate("/login")} className="lm-btn w-full !py-[15px]">
                Go to log in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
