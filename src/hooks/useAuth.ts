// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../services/firebase";

export const useAuth = () => {

  // initially user is set to null
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // logout function
  const logout = async () => {
    await signOut(auth);
    setUser(null)
  }

  return { user, loading, logout };
};
