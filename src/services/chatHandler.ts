// src/services/chatHandler.ts
import { supabase } from './supabase';
import { processAIRequest } from './aiService';
import { updateSessionName } from './chatSessionService';
import { User } from '@supabase/supabase-js';

export type Message = {
  id?: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'ai';
  content: string;
  created_at?: string;
};

// Fetch all messages for a given session
export const getMessages = async (sessionId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  return data || [];
};

// Add a new message to a session
export const addMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }
  return data;
};

// Generate a session name from the first message
const generateSessionName = (firstMessage: string): string => {
  const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
  if (cleanMessage.length <= 40) {
    return cleanMessage;
  }
  return cleanMessage.substring(0, 37) + '...';
};

// Main handler for sending a message
export const handleSendMessage = async (
  input: string,
  user: User,
  selectedSession: string,
) => {
  if (!input.trim() || !user || !selectedSession) return;

  const content = input.trim();

  // 1. Save user message
  await addMessage({
    session_id: selectedSession,
    user_id: user.id,
    role: 'user',
    content,
  });

  // 2. Check if it's the first message to name the session
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('session_id', selectedSession);

  if (error) console.error("Could not count messages to name session:", error);

  if (messages && messages.length === 1) {
    const sessionName = generateSessionName(content);
    await updateSessionName(selectedSession, sessionName);
  }

  // 3. Process with AI and save response
  try {
    const resultText = await processAIRequest(content, user.id);
    await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'ai',
      content: resultText,
    });
  } catch (aiError) {
    console.error("❌ Error in AI service:", aiError);
    const errorMessage = "I couldn't process your request. Please try again. ⚠️";
    await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'ai',
      content: errorMessage,
    });
  }
};
