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
  isBrainMode: boolean,
) => {
  if (!input.trim() || !user || !selectedSession) {
    return;
  }

  const content = input.trim();

  try {
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

    if (error) {
      // Silent fail for session naming
    }

    if (messages && messages.length === 1) {
      const sessionName = generateSessionName(content);
      await updateSessionName(selectedSession, sessionName);
    }

    // 3. Process with AI and save response
    const resultText = await processAIRequest(content, user.id, {
      mode: isBrainMode ? 'brain' : 'command'
    });
    
    await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'ai',
      content: resultText,
    });
    
  } catch (aiError) {
    
    // Determine specific error source for the fallback message
    let source = 'Neural Core';
    let detail = 'I am currently experiencing a disruption in my cognitive sync.';
    
    if (aiError instanceof Error) {
      if (aiError.message.includes('Gemini')) {
        source = 'Gemini Hub';
        detail = 'The primary intelligence node is currently rate-limited or unavailable.';
      } else if (aiError.message.includes('Open Router')) {
        source = 'Reasoning Matrix';
        detail = 'The fallback reasoning cluster is also unresponsive.';
      } else if (aiError.message.includes('Supabase') || aiError.message.includes('fetch')) {
        source = 'Transmission Layer';
        detail = 'Connection to the neural database was interrupted.';
      }
    }

    const errorMessage = `[SYSTEM ERROR @ ${source}]: ${detail}

FALLBACK: I couldn't process your request "${content.substring(0, 20)}${content.length > 20 ? '...' : ''}" at this time. Please try again in a few moments or switch to Brain Mode. ⚠️`;
    try {
      await addMessage({
        session_id: selectedSession,
        user_id: user.id,
        role: 'ai',
        content: errorMessage,
      });
    } catch {
      // Critical failure saving error message
    }
  }
};
