import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoginPicture from "../assets/flat-illustration-1.jpg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user is in the password recovery state
        // You can now allow them to reset their password
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsResetting(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
      setError(error.message);
    } else {
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    }

    setIsResetting(false);
  };



  // Success state
  if (resetSuccess) {
    return (
      <div className="login min-h-screen flex items-center justify-center px-4">
        <div className="md:flex md:w-full md:max-w-screen-xl lg:max-w-screen-2xl">
          <div className="md:w-1/2 flex items-center justify-center">
            <img
              src={LoginPicture}
              alt="reset-password-art"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="md:w-1/2 flex items-center justify-center bg-white">
            <div className="w-full px-8 py-9 rounded-2xl space-y-7 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Password Reset Successfully!</h2>
              <p className="text-gray-600">
                Your password has been updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="login min-h-screen flex items-center justify-center px-4">
      <div className="md:flex md:w-full md:max-w-screen-xl lg:max-w-screen-2xl">
        {/* Image section */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={LoginPicture}
            alt="reset-password-art"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Form section */}
        <div className="md:w-1/2 flex items-center justify-center bg-white">
          <form
            onSubmit={handleResetPassword}
            className="w-full px-8 py-9 rounded-2xl space-y-7"
            style={{ minWidth: 340 }}
            autoComplete="off"
          >
            {/* Logo and Brand */}
            <div className="flex items-center">
              <span className="font-bold text-2xl text-indigo-700 tracking-wide">AuraOne</span>
            </div>

            {/* Heading */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Reset Your Password</h2>
              <p className="text-gray-500 text-base mb-4">
                Enter your new password below.
              </p>
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm"
              disabled={isResetting}
            >
              {isResetting ? 'Resetting Password...' : 'Reset Password'}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 