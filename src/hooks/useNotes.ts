// Notes data actions hook — Handles CRUD operations on notes with real-time sync and async RAG ingestion triggers.

import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ingestItem, removeItem } from "../services/ragIngestionService";

// Interface representing the Note entity schema stored in the Postgres database.
export interface Note {
  id: string; // Unique note UUID.
  user_id: string; // Owner user UUID.
  title: string | null;
  content: string | null;
  tags: string[] | null;
  created_at: string; // ISO 8601 creation timestamp.
  is_archived: boolean;
}

// Data shape required to create a new Note (excludes system-generated fields).
export type NewNote = Omit<Note, "id" | "user_id" | "created_at">;

// Fetch all notes owned by the specified user, sorted newest first.
export const getNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
};

// Retrieve a single note row by its primary key ID.
export const getNoteById = async (noteId: string): Promise<Note | null> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// Subscribe to real-time additions, updates, or deletions of notes for the active user.
export const listenToNotes = (
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`public:notes:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe(() => {
    });

  return channel;
};

// Insert a new note row and queue a background RAG embedding ingestion job.
export const createNote = async (userId: string, note: NewNote): Promise<Note> => {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ ...note, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Trigger non-blocking RAG vector index updates.
  ingestItem(userId, 'note', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Update note fields by ID and trigger a background RAG re-embedding ingestion job.
export const updateNote = async (
  noteId: string,
  updates: Partial<NewNote>
): Promise<Note> => {
  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Trigger non-blocking RAG vector index updates.
  ingestItem(data.user_id, 'note', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Remove a note row by ID and purge its associated vector chunks from pgvector.
export const deleteNote = async (noteId: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw error;
  }

  // Purge deprecated vector records from search indices.
  removeItem(noteId).catch(err => console.error("RAG Removal Error:", err));
};
