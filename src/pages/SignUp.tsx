import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect after successful signup
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-4"
      >
        <div className="font-semibold text-center space-y-1">
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
            Join Aura ✨
          </h2>
          <p className="text-sm font-semibold text-center text-gray-400 dark:text-gray-300">
            Let’s create your account to begin
          </p>
        </div>

        {/* display error */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Email and password input */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Sign Up button */}
        <button
          type="submit"
          className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          Sign Up
        </button>

        {/* Existing User */}
        <p className="text-base text-center text-gray-600 dark:text-gray-300">
          Already a part of Aura?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline dark:text-blue-600"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
