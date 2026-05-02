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
  isBrainMode: boolean,
) => {
  if (!input.trim() || !user || !selectedSession) {
    console.warn('[chatHandler] Missing required fields:', { input, user: !!user, selectedSession });
    return;
  }

  const content = input.trim();
  console.log('[chatHandler] Starting message flow for:', content);

  try {
    // 1. Save user message
    console.log('[chatHandler] Saving user message to Supabase...');
    const userMsg = await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'user',
      content,
    });
    console.log('[chatHandler] User message saved:', userMsg.id);

    // 2. Check if it's the first message to name the session
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('session_id', selectedSession);

    if (error) console.error("[chatHandler] Could not count messages to name session:", error);

    if (messages && messages.length === 1) {
      const sessionName = generateSessionName(content);
      console.log('[chatHandler] First message detected. Updating session name to:', sessionName);
      await updateSessionName(selectedSession, sessionName);
    }

    // 3. Process with AI and save response
    console.log(`[chatHandler] Processing AI request (Brain Mode: ${isBrainMode})...`);
    const resultText = await processAIRequest(content, user.id, {
      mode: isBrainMode ? 'brain' : 'command'
    });
    
    console.log('[chatHandler] AI response received. Saving to Supabase...');
    await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'ai',
      content: resultText,
    });
    console.log('[chatHandler] AI message flow complete.');
    
  } catch (aiError) {
    console.error("❌ [chatHandler] Error in message flow:", aiError);
    
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
      console.log('[chatHandler] Fallback error message saved to Supabase.');
    } catch (saveError) {
      console.error('[chatHandler] CRITICAL: Failed to save fallback message:', saveError);
    }
  }
};
