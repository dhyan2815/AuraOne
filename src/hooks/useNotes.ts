// Notes data actions hook — Handles CRUD operations on notes with real-time sync and async RAG ingestion triggers.

import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { silentIngest, silentRemove } from "../services/ragIngestionService";

export interface Note {
  id: string; // Unique note UUID.
  user_id: string; // Owner user UUID.
  title: string | null;
  content: string | null;
  tags: string[] | null;
  created_at: string; // ISO 8601 creation timestamp.
  is_archived: boolean;
}

export type NewNote = Omit<Note, "id" | "user_id" | "created_at">;

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
    .subscribe();

  return channel;
};

export const createNote = async (userId: string, note: NewNote): Promise<Note> => {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ ...note, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  silentIngest(userId, 'note', data.id);

  return data;
};

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

  silentIngest(data.user_id, 'note', data.id);

  return data;
};

export const deleteNote = async (noteId: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw error;
  }

  silentRemove(noteId);
};
