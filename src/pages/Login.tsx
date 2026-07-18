// Render the Login credentials form, authorizing registered users, and managing navigation flows into dashboard panels.

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AuthLayout from "../components/structure/AuthLayout";


const Login = () => {
  // Access router navigation context, dynamic paths, and auth login action utilities.
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Track credentials input values, visibility toggles, loading state indicators, and scrolling offsets.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Scroll the page viewport down to center on the credential login form elements.
  const scrollToLoginForm = () => {
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Inspect the current location query strings or hashes to automatically focus on the login panel.
  useEffect(() => {
    if (location.hash === '#login' || location.search.includes('scroll=form')) {
      setTimeout(() => {
        scrollToLoginForm();
      }, 500);
    }
  }, [location]);

  // Submit credentials to the auth logic, trigger progress indicators, and route to dashboard.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      await login(email, password);
      toast.success("Logged In Successfully!");
      toast('Welcome back to AuraOne', { icon: '👋' });

      // Route the authenticated user to dashboard after a brief delay for alerts.
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout
      navActionLabel="Sign Up"
      navActionTo="/signup"
      leftContent={
        <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-3 sm:space-y-4">
                <p className="section-header">Welcome Back</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent italic">
                  Enter Your<br />
                  <span className="not-italic text-aurora-on-surface font-extrabold">Professional Workspace.</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-aurora-on-surface-variant font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Your workspace is preserved in the light. Seamlessly continue your flow across every device.
                </p>
              </div>
        </motion.div>
      }
    >
      <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative">
                <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                  <div className="text-center mb-6 sm:mb-10 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter">Welcome Back</h2>
                    <p className="text-sm sm:text-base text-aurora-on-surface-variant font-medium">Securely access your digital workspace.</p>
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error text-sm font-bold text-center bg-error/10 p-4 rounded-2xl border border-error/10"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="section-header mb-0 ml-1">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        className="input-aurora"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label htmlFor="password" className="section-header mb-0">Password</label>
                        <Link to="/forgot-password" className="text-[0.65rem] font-black uppercase tracking-widest text-primary hover:underline">Forgot Password?</Link>
                      </div>
                      <div className="relative group">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="input-aurora pr-12"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="btn-aurora-primary w-full py-3.5 sm:py-4 text-base sm:text-lg shadow-xl shadow-primary/20 mt-4 group"
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign In
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>

                  <p className="text-center text-aurora-on-surface-variant font-medium mt-8">
                    New user?{" "}
                    <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
                  </p>
                </form>

                {/* Decorative Blur */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 blur-[60px] -z-10 rounded-full" />
              </div>
            </motion.div>
    </AuthLayout>
  );
};

export default Login;
