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
      color="tasks"
      leftContent={
        <>
          <h1 className="lm-display max-w-[640px] text-[clamp(56px,7vw,112px)]">Your day, mapped in a minute</h1>
          <ul className="mt-6 grid gap-2.5 text-lg font-semibold">
            {[
              "Tasks, notes and events in one place",
              "Aura acts on plain sentences",
              "Light and dark, desktop and phone",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <i className="h-3.5 w-3.5 flex-none rounded-full bg-[#1F211E]" />
                {item}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <form onSubmit={handleSignUp} className="lm-stagger grid gap-4" autoComplete="off" aria-label="Create account">
        <h2 className="text-[44px] font-extrabold leading-none" style={{ letterSpacing: "-.045em", fontStretch: "75%" }}>Create your account</h2>

        {error && (
          <p role="alert" className="lm-error">
            {error}
          </p>
        )}

        <label htmlFor="name" className="lm-field">
          Name
          <input
            id="name"
            type="text"
            placeholder="How shall we address you?"
            className="lm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label htmlFor="email" className="lm-field">
          Email
          <input
            id="email"
            type="email"
            placeholder="your@future.com"
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

        <button type="submit" disabled={isSigningUp} className="lm-btn w-full !py-[15px]">
          {isSigningUp ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="lm-muted !text-[15px]">
          Already have an account?{" "}
          <Link to="/login" viewTransition className="font-semibold text-ink underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
