// src/hooks/useNotes.ts
import { supabase } from "../services/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

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
    console.error("Error fetching notes:", error);
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
    console.error("Error fetching note by id:", error);
    throw error;
  }
  return data;
};

// Listen for real-time changes to notes
export const listenToNotes = (
  userId: string,
  callback: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`public:notes:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to notes channel!');
      }
      if (err) {
        console.error('Error subscribing to notes channel:', err);
      }
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
    console.error("Error creating note:", error);
    throw error;
  }
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
    console.error("Error updating note:", error);
    throw error;
  }
  return data;
};

// Delete a note
export const deleteNote = async (noteId: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};
