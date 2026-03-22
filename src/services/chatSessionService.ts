// src/services/chatSessionService.ts
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export type Session = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

// Fetch all chat sessions for the current user
export const getSessions = async (userId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
  return data || [];
};

// Create a new chat session
export const createNewSession = async (user: User): Promise<Session> => {
  if (!user) throw new Error('User must be logged in to create a session.');

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: user.id, name: 'New Chat' })
    .select()
    .single();

  if (error) {
    console.error('Error creating new session:', error);
    throw error;
  }
  return data;
};

// Delete a chat session (Supabase will cascade delete messages)
export const deleteSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Update a session's name
export const updateSessionName = async (sessionId: string, name: string): Promise<Session> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ name })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session name:', error);
    throw error;
  }
  return data;
};
