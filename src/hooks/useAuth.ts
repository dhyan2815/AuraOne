// Authentication state management hook — Exposes states for current user, loading flags, auth methods, and session sync.

import { useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

// Manage user authentication status, loading indicators, and error boundaries.
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Sync session state on mount and subscribe to realtime auth status alterations.
  useEffect(() => {
    // Retrieve current session from local cookie or storage.
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Register listener for auth actions (login, logout, token refresh).
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Clean up subscription when the component unmounts.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Authenticate user credentials against database records.
  const login = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error);
      throw error;
    }
  };

  // Create a new user account with credentials and metadata options.
  const signup = async (email: string, password: string, options?: { data: { [key: string]: unknown } }) => {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password, options });
    if (error) {
      setError(error);
      throw error;
    }
  };

  // Terminate user session and purge authentication context.
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, error, login, signup, logout };
};
