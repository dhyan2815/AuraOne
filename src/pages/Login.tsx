import { useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import LoginPicture from "../assets/flat-illustration-1.jpg";

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
    <div className="login min-h-screen flex items-center justify-center px-4">
      <div className="md:flex md:w-full md:max-w-screen-xl lg:max-w-screen-2xl">
        {/* Image section */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={LoginPicture}
            alt="login-art"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Login form styled to match the reference image */}
        <div className="md:w-1/2 flex items-center justify-center bg-white">
          <form
            onSubmit={handleLogin}
            className="w-full px-8 py-9 rounded-2xl space-y-7"
            style={{ minWidth: 340 }}
            autoComplete="off"
          >
            {/* Logo and Brand (optional, can be replaced with your logo) */}
            <div className="flex items-center">
              <span className="font-bold text-2xl text-indigo-700 tracking-wide">AuraOne</span>
            </div>
            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Greetings,<br />Welcome Back!</h2>
            <p className="text-gray-500 text-base mb-4">
              Please sign in to continue to your workspace.
            </p>

            {/* Display error */}
            {error && (
              <p className="text-red-500 text-sm text-center">Incorrect email or password, please try again.</p>
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
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
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
  );
};

export default Login;
