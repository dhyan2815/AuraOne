import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const getUserNotesCollection = (userId: string) => collection(db, "users", userId, "notes");

export const getAllNotes = async (userId : string) => {
  const snapshot = await getDocs(getUserNotesCollection(userId));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getNoteById = async (userId : string, id: string) => {
  const docRef = doc(db, "users", userId, "notes", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createNote = async (userId : string, note: any) => {
  const docRef = await addDoc(getUserNotesCollection(userId), note);
  return { id: docRef.id, ...note };
};

export const updateNote = async (userId : string, id: string, note: any) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await updateDoc(docRef, note);
};

export const deleteNote = async (userId : string, id: string) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await deleteDoc(docRef);
};
