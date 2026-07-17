// Tasks data actions hook — Handles CRUD operations on tasks with real-time sync and async RAG ingestion triggers.

import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { silentIngest, silentRemove } from "../services/ragIngestionService";

export interface Task {
  id: string; // Unique task UUID.
  user_id: string; // Owner user UUID.
  title: string;
  description?: string;
  due_date?: string; // TIMESTAMPTZ formatting for task deadline.
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  created_at?: string; // TIMESTAMPTZ formatting for database entry timestamp.
}

export type NewTask = Omit<Task, "id" | "user_id" | "created_at">;

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

export const listenToTasks = (
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`public:tasks:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe();

  return channel;
};

export const createTask = async (userId: string, task: NewTask): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...task, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  silentIngest(userId, 'task', data.id);

  return data;
};

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

  silentIngest(data.user_id, 'task', data.id);

  return data;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw error;
  }

  silentRemove(taskId);
};
