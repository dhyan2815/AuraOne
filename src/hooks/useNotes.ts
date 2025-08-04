// hooks/useNotes.ts
import { db } from "../services/firebase";
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  starred?: boolean;
  pinned?: boolean;
}

const getUserNotesCollection = (userId: string) =>
  collection(db, "users", userId, "notes");

// Real-time listener
export const listenToNotes = (
  userId: string,
  onNotesChange: (notes: Note[]) => void
) => {
  const unsubscribe = onSnapshot(getUserNotesCollection(userId), (snapshot) => {
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Note, "id">),
    }));
    onNotesChange(notes);
  });

  return unsubscribe;
};

export const getNoteById = async (userId: string, id: string) => {
  const docRef = doc(db, "users", userId, "notes", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists()
    ? ({ id: snapshot.id, ...(snapshot.data() as any) } as Note)
    : null;
};

export const getNotes = async (userId: string): Promise<Note[]> => {
  const snapshot = await getDocs(getUserNotesCollection(userId));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Note, "id">),
  }));
};

export const createNote = async (
  userId: string,
  note: Omit<Note, "id">
) => {
  const docRef = await addDoc(getUserNotesCollection(userId), note);
  return { id: docRef.id, ...note };
};

export const updateNote = async (
  userId: string,
  id: string,
  note: Partial<Note>
) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await updateDoc(docRef, note);
};

export const deleteNote = async (userId: string, id: string) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await deleteDoc(docRef);
};

export const toggleNoteStar = async (
  userId: string,
  id: string,
  starred: boolean
) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await updateDoc(docRef, { starred });
};

export const toggleNotePin = async (
  userId: string,
  id: string,
  pinned: boolean
) => {
  const docRef = doc(db, "users", userId, "notes", id);
  await updateDoc(docRef, { pinned });
};
