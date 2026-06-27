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
import Logo from "../components/structure/Logo";

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
    const [isScrolled, setIsScrolled] = useState(false);

    // Bind scroll listener events to dynamically adjust navigation backdrop layouts.
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        
        // Remove scroll event listeners on unmounting.
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
    <div className="signup min-h-screen text-aurora-on-surface" style={{ scrollBehavior: "smooth" }}>
      {/* Background Animated Gradient Mesh */}
      <div className="aurora-mesh fixed inset-0 z-[-1]" aria-hidden="true" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'glass py-3 border-b border-primary/5' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity cursor-pointer inline-block"
          >
            <Logo iconClassName="w-8 h-8 sm:w-10 sm:h-10" iconOnly />
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-aurora-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="btn-aurora-secondary px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="pt-28 pb-16 sm:pt-40 sm:pb-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
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

            {/* Right Content - Form */}
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
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-10 sm:py-20 border-t border-primary/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
          <Logo iconClassName="w-8 h-8" iconOnly />
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/40 text-center sm:text-left">&copy; 2026 AuraOne. Developed by Dhyan Patel</p>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;

