// hooks/useTasks.ts
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export type TaskStatus = "due" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  dueTime?: string;
  completed: TaskStatus;
  priority: "low" | "medium" | "high";
}

const getUserTasksCollection = (userId: string) =>
  collection(db, "users", userId, "tasks");

export const getTasks = async (userId: string): Promise<Task[]> => {
  const snapshot = await getDocs(getUserTasksCollection(userId));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Task, "id">),
  }));
};

export const addTask = async (
  userId: string,
  task: Omit<Task, "id">
) => {
  return await addDoc(getUserTasksCollection(userId), task);
};

export const updateTask = async (
  userId: string,
  id: string,
  updates: Partial<Task>
) => {
  const ref = doc(db, "users", userId, "tasks", id);
  await updateDoc(ref, updates);
};

export const deleteTask = async (userId: string, id: string) => {
  const ref = doc(db, "users", userId, "tasks", id);
  await deleteDoc(ref);
};
