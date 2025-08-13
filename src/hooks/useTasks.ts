// hooks/useTasks.ts
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
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
  createdAt?: string;
  pinned?: boolean;
  starred?: boolean;
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

export const getTaskById = async (userId: string, taskId: string): Promise<Task | null> => {
  const taskRef = doc(db, "users", userId, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  
  if (taskSnap.exists()) {
    return {
      id: taskSnap.id,
      ...(taskSnap.data() as Omit<Task, "id">),
    };
  }
  return null;
};

export const listenToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  // First try to get tasks ordered by createdAt
  const q = query(getUserTasksCollection(userId), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt exists, use current time if missing
        createdAt: data.createdAt || new Date().toISOString(),
      } as Task;
             });
         callback(tasks);
  }, (error) => {
    console.error('listenToTasks: Error listening to tasks:', error);
    // Fallback: get all tasks without ordering
    const fallbackQuery = query(getUserTasksCollection(userId));
    onSnapshot(fallbackQuery, (fallbackSnapshot) => {
      const fallbackTasks = fallbackSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
        } as Task;
               });
         callback(fallbackTasks);
    });
  });
};

export const addTask = async (
  userId: string,
  task: Omit<Task, "id">
) => {
  return await addDoc(getUserTasksCollection(userId), task);
};

export const createTask = async (
  userId: string,
  task: Omit<Task, "id">
) => {
  const docRef = await addDoc(getUserTasksCollection(userId), task);
  return docRef.id;
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

export const toggleTaskStar = async (
  userId: string,
  id: string,
  starred: boolean
) => {
  const ref = doc(db, "users", userId, "tasks", id);
  await updateDoc(ref, { starred });
};

export const toggleTaskPin = async (
  userId: string,
  id: string,
  pinned: boolean
) => {
  const ref = doc(db, "users", userId, "tasks", id);
  await updateDoc(ref, { pinned });
};
