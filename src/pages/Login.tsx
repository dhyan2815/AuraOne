import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to scroll to the login form
  const scrollToLoginForm = () => {
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Handle smooth scrolling when coming from other pages or with hash
  useEffect(() => {
    if (location.hash === '#login' || location.search.includes('scroll=form')) {
      setTimeout(() => {
        scrollToLoginForm();
      }, 500);
    }
  }, [location]);

  // Login logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(""); // Clear any previous errors

    try {
      await login(email, password);
      toast.success("Logged In Successfully!");
      toast('Welcome back to AuraOne', { icon: '👋' });

      // Small delay to show the success message before navigation
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login min-h-screen text-aurora-on-surface" style={{ scrollBehavior: "smooth" }}>
      {/* Background Animated Gradient Mesh */}
      <div className="aurora-mesh fixed inset-0 z-[-1]" aria-hidden="true" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'glass py-3 border-b border-primary/5' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-aurora-on-surface">AuraOne</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/signup"
              className="text-sm font-bold text-aurora-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
            >
              Sign Up
            </Link>
            <Link
              to="/"
              className="btn-aurora-secondary px-8 py-3"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="pt-40 pb-32">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <p className="section-header">Returning to Excellence</p>
                <h1 className="display-lg leading-tight bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent italic">
                  Enter Your<br />
                  <span className="not-italic text-aurora-on-surface font-extrabold">Luminous Sanctuary.</span>
                </h1>
                <p className="text-xl text-aurora-on-surface-variant font-medium leading-relaxed max-w-xl">
                  Your workspace is preserved in the light. Seamlessly continue your flow across every device.
                </p>
              </div>

              {/* Stats / Proof */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-primary">10k+</p>
                  <p className="section-header mb-0 text-[0.6rem]">Visionaries</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-secondary">Free</p>
                  <p className="section-header mb-0 text-[0.6rem]">Always</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-tertiary">4.9/5</p>
                  <p className="section-header mb-0 text-[0.6rem]">Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="glass-panel p-10 rounded-[2.5rem] shadow-2xl relative">
                <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                  <div className="text-center mb-10 space-y-2">
                    <h2 className="headline-sm text-3xl tracking-tighter">Welcome Back</h2>
                    <p className="text-aurora-on-surface-variant font-medium">Authentication for the modern mind.</p>
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
                      <label htmlFor="email" className="section-header mb-0 ml-1">Universal Identifier</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="your@sanctuary.com"
                        className="input-aurora"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label htmlFor="password" className="section-header mb-0">Secure Key</label>
                        <Link to="/forgot-password" className="text-[0.65rem] font-black uppercase tracking-widest text-primary hover:underline">Secret Forgotten?</Link>
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
                    className="btn-aurora-primary w-full py-4 text-lg shadow-xl shadow-primary/20 mt-4 group"
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Aligning Flows...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Restore Session
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>

                  <p className="text-center text-aurora-on-surface-variant font-medium mt-8">
                    New visionary?{" "}
                    <Link to="/signup" className="text-primary font-bold hover:underline">Initiate Sanctuary</Link>
                  </p>
                </form>

                {/* Decorative Blur */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 blur-[60px] -z-10 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-20 border-t border-primary/5">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">AuraOne</span>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-primary/40">&copy; 2026 AuraOne Registry. Developed by Dhyan Patel</p>
        </div>
      </footer>
    </div>
  );

};

export default Login;
