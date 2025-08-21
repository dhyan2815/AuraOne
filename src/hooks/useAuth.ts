// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../services/firebase";
import { sendVerificationEmail } from "../services/firebase";

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
    setUser(null);
  };

  // send verification email function
  const sendEmailVerification = async () => {
    try {
      await sendVerificationEmail();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return { 
    user, 
    loading, 
    logout, 
    sendEmailVerification,
    isEmailVerified: user?.emailVerified || false 
  };
};
