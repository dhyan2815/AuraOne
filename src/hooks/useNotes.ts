// src/services/noteService.ts
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

const notesRef = collection(db, "notes");

export const getAllNotes = async () => {
  const snapshot = await getDocs(notesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getNoteById = async (id: string) => {
  const docRef = doc(db, "notes", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createNote = async (note: any) => {
  const docRef = await addDoc(notesRef, note);
  return { id: docRef.id, ...note };
};

export const updateNote = async (id: string, note: any) => {
  const docRef = doc(db, "notes", id);
  await updateDoc(docRef, note);
};

export const deleteNote = async (id: string) => {
  const docRef = doc(db, "notes", id);
  await deleteDoc(docRef);
};
