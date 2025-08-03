import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoginPicture from "../assets/flat-illustration-1.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success("Password reset email sent successfully!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error("No account found with this email address");
          break;
        case 'auth/invalid-email':
          toast.error("Please enter a valid email address");
          break;
        case 'auth/too-many-requests':
          toast.error("Too many attempts. Please try again later");
          break;
        case 'auth/network-request-failed':
          toast.error("Network error. Please check your connection");
          break;
        default:
          toast.error("Failed to send reset email. Please try again");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="login min-h-screen flex items-center justify-center px-4">
      <div className="md:flex md:w-full md:max-w-screen-xl lg:max-w-screen-2xl">
        {/* Image section */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={LoginPicture}
            alt="forgot-password-art"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Form section */}
        <div className="md:w-1/2 flex items-center justify-center bg-white">
          <div
            className="w-full px-8 py-9 rounded-2xl space-y-7"
            style={{ minWidth: 340 }}
          >
            {/* Logo and Brand */}
            <div className="flex items-center">
              <span className="font-bold text-2xl text-indigo-700 tracking-wide">AuraOne</span>
            </div>

            {!emailSent ? (
              <>
                {/* Heading */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
                  <p className="text-gray-500 text-base mb-4">
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Reset Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@gmail.com"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Reset Button */}
                  <button
                    type="submit"
                    className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                    disabled={isSending}
                  >
                    <Mail size={18} />
                    {isSending ? 'Sending Reset Email...' : 'Send Reset Email'}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-500 text-base">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Didn't receive the email?</strong> Check your spam folder or try again with a different email address.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail("");
                      }}
                      className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm"
                    >
                      Send Another Email
                    </button>
                    
                    <Link
                      to="/login"
                      className="block w-full py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base transition-colors shadow-sm text-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 