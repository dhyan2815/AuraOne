import { useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, Zap, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoginPicture from "../assets/flat-illustration-3.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Login logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged In Successfully")
      toast('Welcome to AuraOne', { icon: '👋' });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast.error(`Login Failed: ${err.message}`)
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Welcome Back Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome Back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AuraOne</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Continue your productivity journey. Your workspace is ready and waiting for you.
          </p>
        </div>
      </div>

      {/* Full-width Image and Credential Section */}
      <div className="w-full px-4 pb-16">
        <div className="md:flex md:max-w-screen-xl lg:max-w-screen-2xl mx-auto">
          {/* Image section */}
          <div className="md:w-full flex items-center justify-center rounded-xl mb-8 md:mb-0 z-0">
            <img
              src={LoginPicture}
              alt="login-art"
              className="w-full rounded-xl h-full object-cover shadow-2xl"
            />
          </div>

          {/* Login form styled to match the reference image */}
          <div className="md:w-1/2 flex items-center rounded-xl justify-center bg-white shadow-xl z-10">
            <form
              onSubmit={handleLogin}
              className="w-full px-8 py-9 space-y-7"
              style={{ minWidth: 340 }}
              autoComplete="off"
            >
              {/* Logo and Brand */}
              <div className="flex items-center">
                <span className="font-bold text-2xl text-indigo-700 tracking-wide">AuraOne</span>
              </div>

              {/* Enhanced Heading */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Greetings,<br />Welcome Back!</h2>
                <p className="text-gray-500 text-base">
                  Please sign in to continue to your workspace.
                </p>
              </div>

              {/* Security Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Secure Connection</p>
                    <p className="text-xs text-green-600">Your data is encrypted and protected</p>
                  </div>
                </div>
              </div>

              {/* Display error */}
              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">Incorrect email or password, please try again.</p>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Enhanced Login Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Signing In...' : '🚀 Welcome Back'}
              </button>

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
              <p className="text-sm text-center text-gray-500 mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's New in AuraOne</h2>
            <p className="text-gray-600">Discover the latest features and improvements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enhanced AI Assistant</h3>
              <p className="text-gray-600 text-sm">Smarter conversations and better productivity insights</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor your productivity and optimize your workflow</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Improved Security</h3>
              <p className="text-gray-600 text-sm">Enhanced encryption and privacy protection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
