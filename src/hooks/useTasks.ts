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

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  dueTime?: string;
  completed: TaskStatus;
  priority: "low" | "medium" | "high";
}

export type TaskStatus = "due" | "completed";

// Function to get the user's tasks collection reference
const getUserTasksCollection = (userId : string) => collection(db, "users", userId, "tasks");

// Function to fetch tasks from Firestore
export const getTasks = async (userId : string): Promise<Task[]> => {
  const snapshot = await getDocs(getUserTasksCollection(userId));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
};

// Function to add a new task to Firestore
export const addTask = async (userId: string, task: Omit<Task, "id">) => {
  return await addDoc(getUserTasksCollection(userId), task);
};

// Function to update a task in Firestore
export const updateTask = async (userId : string, id: string, updates: Partial<Task>) => {
  const ref = doc(db, "users", userId, "tasks", id);
  await updateDoc(ref, updates);
};

// Function to delete a task from Firestore
export const deleteTask = async (userId : string, id: string) => {
  const ref = doc(db, "users", userId, "tasks", id);
  await deleteDoc(ref);
};
