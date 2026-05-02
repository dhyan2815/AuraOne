// src/hooks/useEvents.ts
import { supabase } from "../services/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

// The Event interface matches the Supabase 'events' table
export interface Event {
  id: string; // uuid
  user_id: string; // uuid
  title: string;
  start_time: string; // TIMESTAMPTZ
  end_time: string | null; // TIMESTAMPTZ
  description: string | null;
  created_at: string; // TIMESTAMPTZ
}

// Type for creating a new event
export type NewEvent = Omit<Event, "id" | "user_id" | "created_at">;

// Fetch all events for the current user
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

// Listen for real-time changes to events
export const listenToEvents = (
  userId: string,
  callback: (payload: any) => void
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

// Create a new event
export const createEvent = async (userId: string, event: NewEvent): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .insert([{ ...event, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw error;
  }
};
