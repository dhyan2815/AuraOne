// Chat session CRUD service — Manages the creation, deletion, renaming, and listing of chat sessions.

import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Data shape representing a chat session record stored in Supabase.
export type Session = {
  id: string; // Unique session UUID.
  name: string; // Custom or auto-generated session title.
  user_id: string; // Associated user owner UUID.
  created_at: string; // ISO 8601 creation timestamp.
};

// Retrieve all chat sessions belonging to a user, sorted newest first.
export const getSessions = async (userId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
};

// Instantiate a new chat session placeholder with a default name.
export const createNewSession = async (user: User): Promise<Session> => {
  if (!user) throw new Error('User must be logged in to create a session.');

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: user.id, name: 'New Chat' })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// Delete a session and rely on Supabase cascading rules to purge related messages.
export const deleteSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    throw error;
  }
};

// Modify the display name of a chat session.
export const updateSessionName = async (sessionId: string, name: string): Promise<Session> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ name })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};
