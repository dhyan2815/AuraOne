import { db } from "../services/firebase";
import {
  collection,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

// Helper to get user's notes collection
const getUserNotesCollection = (userId: string) =>
  collection(db, "users", userId, "notes");

// Real-time listener
export const listenToNotes = (
  userId: string,
  onNotesChange: (notes: any[]) => void
) => {
  const unsubscribe = onSnapshot(getUserNotesCollection(userId), (snapshot) => {
    const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    onNotesChange(notes);
  });

  return unsubscribe; // Call in cleanup
};

//  Fetch single note
export const getNoteById = async (userId: string, id: string) => {
  const docRef = doc(db, "users", userId, "notes", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

//  Create note
export const createNote = async (userId: string, note: any) => {
  const docRef = await addDoc(getUserNotesCollection(userId), note);
  return { id: docRef.id, ...note, createdAt: new Date().toISOString() };
};

//  Update note
export const updateNote = async (userId: string, id: string, note: any) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await updateDoc(docRef, note);
};

//  Delete note (with verification)
export const deleteNote = async (userId: string, id: string) => {
  try {
    const docRef = doc(db, "users", userId, "notes", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Note not found");
    await deleteDoc(docRef);
  } catch (error) {
    console.error("❌ Delete failed:", error);
    throw error;
  }
};