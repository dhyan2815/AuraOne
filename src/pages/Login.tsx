import { useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { LoginPicture } from "../assets/flat-illustration-1.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Login logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged In Successfully")
      toast('Welcome to AuraOne', { icon: '👋' });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="md:flex md:w-full md:max-w-screen-xl lg:max-w-screen-2xl">
        {/* Image section */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={LoginPicture}
            alt="login-art"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Login form */}
        <div className="md:w-1/2 flex items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg space-y-4"
          >
            <div className="font-semibold text-center space-y-1">
              <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
                Welcome back 👋
                <br />
              </h2>
              <p className="text-sm font-semibold text-center text-gray-400 dark:text-gray-300">
                Let’s login into your account..
              </p>
            </div>

            {/* Display error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="space-y-4">
              {/* Input Email */}
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {/* Password Input */}
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* Password Visbility */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Login
            </button>

            {/* For new user? */}
            <p className="text-base text-center text-gray-600 dark:text-gray-300">
              New to Aura?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline dark:text-blue-600"
              >
                Sign Up here!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
