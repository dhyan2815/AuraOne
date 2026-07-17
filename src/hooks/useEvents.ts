// Events data actions hook — Handles CRUD operations on calendar events with real-time sync and async RAG ingestion triggers.

import { supabase } from "../services/supabase";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { silentIngest, silentRemove } from "../services/ragIngestionService";

export interface Event {
  id: string; // Unique event UUID.
  user_id: string; // Owner user UUID.
  title: string;
  start_time: string; // TIMESTAMPTZ formatting for event start.
  end_time: string | null; // TIMESTAMPTZ formatting for event end.
  description: string | null;
  created_at: string; // TIMESTAMPTZ formatting for database entry timestamp.
}

export type NewEvent = Omit<Event, "id" | "user_id" | "created_at">;

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
    .subscribe();

  return channel;
};

export const createEvent = async (userId: string, event: NewEvent): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .insert([{ ...event, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  silentIngest(userId, 'event', data.id);

  return data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw error;
  }

  silentRemove(eventId);
};

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

  silentIngest(data.user_id, 'event', data.id);

  return data;
};
