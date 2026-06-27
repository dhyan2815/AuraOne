// Tasks data actions hook — Handles CRUD operations on tasks with real-time sync and async RAG ingestion triggers.

import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ingestItem, removeItem } from "../services/ragIngestionService";

// Interface representing the Task entity schema stored in the Postgres database.
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

// Data shape required to create a new Task (excludes system-generated fields).
export type NewTask = Omit<Task, "id" | "user_id" | "created_at">;

// Fetch all tasks owned by the specified user, sorted newest first.
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

// Retrieve a single task row by its primary key ID.
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

// Subscribe to real-time additions, updates, or deletions of tasks for the active user.
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
    .subscribe(() => {
    });

  return channel;
};

// Insert a new task row and queue a background RAG embedding ingestion job.
export const createTask = async (userId: string, task: NewTask): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...task, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Trigger non-blocking RAG vector index updates.
  ingestItem(userId, 'task', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Update task fields by ID and trigger a background RAG re-embedding ingestion job.
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

  // Trigger non-blocking RAG vector index updates.
  ingestItem(data.user_id, 'task', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Remove a task row by ID and purge its associated vector chunks from pgvector.
export const deleteTask = async (taskId: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw error;
  }

  // Purge deprecated vector records from search indices.
  removeItem(taskId).catch(err => console.error("RAG Removal Error:", err));
};
