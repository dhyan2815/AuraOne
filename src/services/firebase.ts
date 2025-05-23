// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCYgFzTJ9-HkDaH9s-8m9v3ZQU3FlvOOMM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aura-one1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aura-one1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aura-one1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '682064600664',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:682064600664:web:dc83bc824f7c215533342d',
  measurementId: import.meta.env.VITE_MEASUREMENT_ID || 'G-3YHZG7D8TM'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
