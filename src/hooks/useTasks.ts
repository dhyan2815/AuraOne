import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

const tasksCollection = collection(db, "tasks");

export const getTasks = async (): Promise<Task[]> => {
  const snapshot = await getDocs(tasksCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
};

export const addTask = async (task: Omit<Task, "id">) => {
  await addDoc(tasksCollection, task);
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const ref = doc(db, "tasks", id);
  await updateDoc(ref, updates);
};

export const deleteTask = async (id: string) => {
  const ref = doc(db, "tasks", id);
  await deleteDoc(ref);
};
