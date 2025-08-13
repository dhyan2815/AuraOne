import { useState, useEffect } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
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
  const [isValidCode, setIsValidCode] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Get the oobCode from URL parameters
  const oobCode = searchParams.get("oobCode");

  // Verify the reset code when component mounts
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setIsCheckingCode(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true);
      } catch (error: any) {
        console.error("Invalid reset code:", error);
        setIsValidCode(false);
        
        // Handle specific errors
        switch (error.code) {
          case 'auth/invalid-action-code':
            toast.error("Invalid or expired reset link");
            break;
          case 'auth/expired-action-code':
            toast.error("Reset link has expired. Please request a new one.");
            break;
          default:
            toast.error("Invalid reset link");
        }
      } finally {
        setIsCheckingCode(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      toast.error("Invalid reset link");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsResetting(true);
    
    try {
      // First, get the email from the reset code
      const email = await verifyPasswordResetCode(auth, oobCode);
      
      // Reset password in Firebase Auth
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      // Update password in Firestore (if you need to keep it there)
      try {
        // Find user document by email and update password
        // Note: This requires a query since we don't have the user ID
        // In production, consider storing user ID in the reset flow or using a different approach
        // Password updated successfully
        
        // If you need to update Firestore, you would do something like:
        // const usersRef = collection(db, "users");
        // const q = query(usersRef, where("email", "==", email));
        // const querySnapshot = await getDocs(q);
        // if (!querySnapshot.empty) {
        //   const userDoc = querySnapshot.docs[0];
        //   await updateDoc(userDoc.ref, { password: newPassword });
        // }
        
      } catch (firestoreError) {
        console.error("Failed to update Firestore:", firestoreError);
        // Don't fail the reset if Firestore update fails
        toast.error("Password reset successful, but failed to update additional data");
      }
      
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      switch (error.code) {
        case 'auth/weak-password':
          toast.error("Password is too weak. Please choose a stronger password.");
          break;
        case 'auth/invalid-action-code':
          toast.error("Invalid or expired reset link");
          break;
        case 'auth/expired-action-code':
          toast.error("Reset link has expired. Please request a new one.");
          break;
        default:
          toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Loading state while checking the reset code
  if (isCheckingCode) {
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600">Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or expired reset code
  if (!isValidCode || !oobCode) {
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
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
              <p className="text-gray-600">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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