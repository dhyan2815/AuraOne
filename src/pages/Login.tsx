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
      color="today"
      leftContent={
        <>
          <h1 className="lm-display max-w-[640px] text-[clamp(56px,7vw,112px)]">Welcome back to your day</h1>
          <p className="mt-4 max-w-[460px] text-[19px]">
            Your tasks, notes and events are where you left them. Aura picks up from your last session.
          </p>
        </>
      }
    >
      <form onSubmit={handleLogin} className="grid gap-[18px]" autoComplete="off" aria-label="Log in">
        <h2 className="text-[44px] font-extrabold leading-none" style={{ letterSpacing: "-.045em", fontStretch: "75%" }}>Log in</h2>

        {error && (
          <p role="alert" className="lm-error">
            {error}
          </p>
        )}

        <label htmlFor="email" className="lm-field">
          Email
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            className="lm-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <div className="lm-field">
          <label htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="lm-input pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink2 transition-colors hover:text-ink"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end text-[15px] font-semibold">
          <Link to="/forgot-password" className="underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={isLoggingIn} className="lm-btn w-full !py-[15px]">
          {isLoggingIn ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="lm-muted !text-[15px]">
          New to AuraOne?{" "}
          <Link to="/signup" className="font-semibold text-ink underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
