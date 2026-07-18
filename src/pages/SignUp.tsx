// Render the account registration interface, capturing user names and credentials to provision new user database workspaces.

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

const SignUp = () => {
    // Access navigation utilities, current path location parameters, and auth signup dispatch methods.
    const navigate = useNavigate();
    const location = useLocation();
    const { signup } = useAuth();
    
    // Track form registration inputs, password visibility toggles, loading state indicators, and scroll positions.
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false);

    // Scroll viewport context down to auto-align on the signup form container.
    const scrollToSignUpForm = () => {
        const formElement = document.querySelector("form");
        if (formElement) {
            formElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    // Inspect URL parameters or hashes on page load to focus viewport context on sign-up panels.
    useEffect(() => {
        if (
            location.hash === "#signup" ||
            location.search.includes("scroll=form")
        ) {
            setTimeout(() => {
                scrollToSignUpForm();
            }, 500);
        }
    }, [location]);

    // Dispatch profile credentials to auth registration API, displaying success toasts and routing to dashboard.
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSigningUp(true);
        setError("");

        try {
            await signup(email, password, { data: { name } });

            toast.success("Registration Successful! Welcome to AuraOne");
            toast("Redirecting to your dashboard...", { icon: "🚀" });

            // Small delay to present confirmation alerts prior to router redirection.
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            toast.error(`Registration Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSigningUp(false);
        }
    };

  return (
    <AuthLayout
      navActionLabel="Sign In"
      navActionTo="/login"
      leftContent={
        <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-3 sm:space-y-4">
                <p className="section-header">Join the Platform</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent italic">
                  Craft Your<br />
                  <span className="not-italic text-aurora-on-surface font-extrabold">Digital Workspace.</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-aurora-on-surface-variant font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Step into the future of productivity. A workspace designed to adapt, illuminate, and empower your every thought.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 text-left max-w-lg mx-auto lg:mx-0">
                {[
                  { title: "Intelligent Design", desc: "Aesthetic meets function in harmony." },
                  { title: "Universal Sync", desc: "Your data, everywhere, instantly." },
                  { title: "AI Integration", desc: "Augmented cognition by default." },
                  { title: "Privacy First", desc: "Enterprise-grade security for your data." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-bold text-aurora-on-surface">{item.title}</p>
                      <p className="text-xs sm:text-sm text-aurora-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
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
                <form onSubmit={handleSignUp} className="space-y-6" autoComplete="off">
                  <div className="text-center mb-6 sm:mb-10 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter">Create Account</h2>
                    <p className="text-sm sm:text-base text-aurora-on-surface-variant font-medium">Get started with AuraOne today.</p>
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
                      <label htmlFor="name" className="section-header mb-0 ml-1">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="How shall we address you?"
                        className="input-aurora"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="section-header mb-0 ml-1">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="your@future.com"
                        className="input-aurora"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="section-header mb-0 ml-1">Password</label>
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
                    disabled={isSigningUp}
                    className="btn-aurora-primary w-full py-3.5 sm:py-4 text-base sm:text-lg shadow-xl shadow-primary/20 mt-4 group"
                  >
                    {isSigningUp ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign Up
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>

                  <p className="text-center text-aurora-on-surface-variant font-medium mt-8">
                    Already a user?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                  </p>
                </form>

                {/* Decorative Blur */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[60px] -z-10 rounded-full" />
              </div>
            </motion.div>
    </AuthLayout>
  );
};

export default SignUp;

