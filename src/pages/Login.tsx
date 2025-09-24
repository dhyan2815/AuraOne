import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
    Eye,
    EyeOff,
    CheckCircle,
    Calendar,
    MessageSquare,
    FileText,
    Sparkles,
    Shield,
    ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      await signInWithEmailAndPassword(auth, email, password);
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
    <div
      className="login min-h-screen bg-white"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/30 backdrop-blur-xl border-white/40 shadow-lg shadow-black/10"
            : "bg-white/20 backdrop-blur-xl border-white/30 shadow-lg shadow-black/5"
        }`}
      >
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-4 h-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AuraOne</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/signup"
                className="text-black hover:text-indigo-600 transition-colors font-medium text-lg"
              >
                Sign Up
              </Link>
              <Link
                to="/"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-md font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md text-lg"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Form */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 mt-0">
        <div className="container mx-auto px-4">
          <div className="max-w-8xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              {/* Left Content */}
              <div className="space-y-4 lg:col-span-2">
                <div className="space-y-4 mt-2">
                  <h1 className="text-3xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Welcome Back to
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block">
                      AuraOne
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                    Continue your productivity journey. Your workspace is ready and waiting for you with all your tasks, notes, and calendar events.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 pt-0">
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-3xl font-bold text-indigo-600">
                      10+
                    </div>
                    <div className="text-black font-medium text-sm">
                      Active Users
                    </div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-3xl font-bold text-indigo-600">
                      100%
                    </div>
                    <div className="text-black font-medium text-sm">Free</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-3xl font-bold text-indigo-600">
                      ★★★★
                    </div>
                    <div className="text-black font-medium text-sm">
                      User Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Form */}
              <div className="lg:col-span-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/30">
                  <form
                    onSubmit={handleLogin}
                    className="max-w-2xl mx-auto space-y-4"
                    autoComplete="off"
                  >

                    {/* Enhanced Heading */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back to AuraOne
                      </h2>
                      <p className="text-gray-600 text-base">
                        Continue your productivity journey and access your workspace.
                      </p>
                    </div>

                    {/* Display error */}
                    {error && (
                      <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                        {error}
                      </p>
                    )}

                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-700 text-md font-medium mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="name@gmail.com"
                        className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-gray-700 text-md font-medium mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Login Button */}
                    <button
                      type="submit"
                      className={`w-full py-2 px-2 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg transform flex items-center justify-center group ${
                        isLoggingIn
                          ? "bg-gray-400 cursor-not-allowed shadow-md"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5"
                      } text-white`}
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing In...
                        </div>
                      ) : (
                        <>
                          Welcome Back
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    {/* Security Note */}
                    <p className="text-xs text-center text-gray-500">
                      🔒 Your data is encrypted and secure. We never share your
                      information.
                    </p>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    {/* For new user? */}
                    <p className="text-lg text-center text-gray-500 mt-4">
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/signup?scroll=form"
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Sign Up here
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to Stay
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {" "}
                Productive
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AuraOne combines all your essential productivity tools in one
              intelligent, beautiful interface designed for modern workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Calendar className="w-6 h-6 text-indigo-600" />,
                title: "Smart Calendar",
                description:
                  "Organize your schedule with intelligent event management and smart reminders.",
                gradient: "from-indigo-50 to-purple-50",
                iconBg: "bg-indigo-100",
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                title: "Task Management",
                description:
                  "Track and complete tasks with priority levels, deadlines, and progress tracking.",
                gradient: "from-green-50 to-emerald-50",
                iconBg: "bg-green-100",
              },
              {
                icon: <FileText className="w-6 h-6 text-blue-600" />,
                title: "Rich Notes",
                description:
                  "Create, organize, and search through your notes with powerful rich text editing.",
                gradient: "from-blue-50 to-cyan-50",
                iconBg: "bg-blue-100",
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
                title: "AI Assistant",
                description:
                  "Get intelligent help and insights from our advanced AI-powered chat assistant.",
                gradient: "from-purple-50 to-pink-50",
                iconBg: "bg-purple-100",
              },
              {
                icon: <Sparkles className="w-6 h-6 text-yellow-600" />,
                title: "Smart Widgets",
                description:
                  "Weather, news, and productivity widgets at your fingertips.",
                gradient: "from-yellow-50 to-orange-50",
                iconBg: "bg-yellow-100",
              },
              {
                icon: <Shield className="w-6 h-6 text-red-600" />,
                title: "Secure & Private",
                description:
                  "Your data is encrypted and protected with enterprise-grade security measures.",
                gradient: "from-red-50 to-rose-50",
                iconBg: "bg-red-100",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group backdrop-blur-sm border border-white/20`}
              >
                <div
                  className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-md">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Built for Modern Productivity
            </h2>
            <p className="text-lg text-gray-600">
              A comprehensive dashboard that brings together all your essential
              tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">5+</div>
              <div className="text-gray-600">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                100%
              </div>
              <div className="text-gray-600">Free & Open Source</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                Instant
              </div>
              <div className="text-gray-600">Smart Productivity Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Continue Your Journey?
            </h2>
            <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
              Access your personalized workspace and continue where you left off.
              Your tasks, notes, and calendar are all synchronized and ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={scrollToLoginForm}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center group"
              >
                Access Your Workspace
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/signup?scroll=form"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AuraOne</span>
              </div>
              <p className="text-gray-400">
                Your all-in-one productivity hub for the modern digital workspace.
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Beta Version</span>
                </span>
                <span>-</span>
                <span>Free</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a 
                    href="mailto:dhyan.work.2815@gmail.com" 
                    className="hover:text-white transition-colors"
                  >
                    dhyan.work.2815@gmail.com
                  </a>
                </li>
                <li>
                  <a 
                    href="https://dhyan-patel.onrender.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Developer Portfolio
                  </a>
                </li>
                <li className="text-sm text-gray-500">
                  We're just getting started! 
                  <br />
                  Your feedback shapes our future.
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AuraOne. All rights reserved.</p>
            <p> Developed by Dhyan Patel </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
