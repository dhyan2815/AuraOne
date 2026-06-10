// src/hooks/useNotes.ts
import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ingestItem, removeItem } from "../services/ragIngestionService";

// The Note interface now matches the Supabase table schema
export interface Note {
  id: string; // uuid
  user_id: string; // uuid
  title: string | null;
  content: string | null;
  tags: string[] | null;
  created_at: string; // TIMESTAMPTZ
  is_archived: boolean;
}

// Type for creating a new note
export type NewNote = Omit<Note, "id" | "user_id" | "created_at">;

// Fetch all notes for the current user
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

// Fetch a single note by its ID
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

// Listen for real-time changes to notes
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

// Create a new note
export const createNote = async (userId: string, note: NewNote): Promise<Note> => {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ ...note, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Trigger RAG ingestion
  ingestItem(userId, 'note', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Update an existing note
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

  // Trigger RAG ingestion
  ingestItem(data.user_id, 'note', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Delete a note
export const deleteNote = async (noteId: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw error;
  }

  // Remove from RAG index
  removeItem(noteId).catch(err => console.error("RAG Removal Error:", err));
};
