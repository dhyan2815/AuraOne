// Events data actions hook — Handles CRUD operations on calendar events with real-time sync and async RAG ingestion triggers.

import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ingestItem, removeItem } from "../services/ragIngestionService";

// Interface representing the Event entity schema stored in the Postgres database.
export interface Event {
  id: string; // Unique event UUID.
  user_id: string; // Owner user UUID.
  title: string;
  start_time: string; // TIMESTAMPTZ formatting for event start.
  end_time: string | null; // TIMESTAMPTZ formatting for event end.
  description: string | null;
  created_at: string; // TIMESTAMPTZ formatting for database entry timestamp.
}

// Data shape required to create a new Event (excludes system-generated fields).
export type NewEvent = Omit<Event, "id" | "user_id" | "created_at">;

// Fetch all events owned by the specified user, sorted chronological start time.
export const getEvents = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }
  return data || [];
};

// Subscribe to real-time additions, updates, or deletions of events for the active user.
export const listenToEvents = (
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`public:events:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "events", filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe(() => {
    });

  return channel;
};

// Insert a new event row and queue a background RAG embedding ingestion job.
export const createEvent = async (userId: string, event: NewEvent): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .insert([{ ...event, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Trigger non-blocking RAG vector index updates.
  ingestItem(userId, 'event', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};

// Remove an event row by ID and purge its associated vector chunks from pgvector.
export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw error;
  }

  // Purge deprecated vector records from search indices.
  removeItem(eventId).catch(err => console.error("RAG Removal Error:", err));
};

// Update event fields by ID and trigger a background RAG re-embedding ingestion job.
export const updateEvent = async (eventId: string, updates: Partial<NewEvent>): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Trigger non-blocking RAG vector index updates.
  ingestItem(data.user_id, 'event', data.id).catch(err => console.error("RAG Ingestion Error:", err));

  return data;
};
