// src/hooks/useTasks.ts
import { supabase } from "../services/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

// The Task interface now matches the Supabase table schema
export interface Task {
  id: string; // uuid
  user_id: string; // uuid
  title: string;
  description?: string;
  due_date?: string; // TIMESTAMPTZ
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  created_at?: string; // TIMESTAMPTZ
}

// Type for creating a new task, `id`, `user_id` and `created_at` are optional
export type NewTask = Omit<Task, "id" | "user_id" | "created_at">;

// Fetch all tasks for the current user
export const getTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
};

// Fetch a single task by its ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// Listen for real-time changes to tasks
export const listenToTasks = (
  userId: string,
  callback: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`public:tasks:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe(() => {
    });

  return channel;
};

// Create a new task
export const createTask = async (userId: string, task: NewTask): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...task, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// Update an existing task
export const updateTask = async (
  taskId: string,
  updates: Partial<NewTask>
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw error;
  }
};
