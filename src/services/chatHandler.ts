// Chat message lifecycle handler — Coordinates saving messages, updating titles, invoking agents, and generating error fallbacks.

import { supabase } from './supabase';
import { updateSessionName } from './chatSessionService';
import { User } from '@supabase/supabase-js';
import { processAgenticRequest } from './agentOrchestrator';

// Data shape for single chat message records stored in Supabase.
export type Message = {
  id?: string; // Optional message UUID.
  session_id: string; // Parent session UUID.
  user_id: string; // Associated user UUID.
  role: 'user' | 'ai'; // Message author role.
  content: string; // Message body text.
  created_at?: string; // TIMESTAMPTZ formatting for timestamp.
  metadata?: {
    sources?: Array<{ id: string; sourceType: string; title: string; content: string; similarity: number }>;
    toolsUsed?: string[];
  };
};

// Fetch chat logs sorted oldest to newest for a specific session ID.
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

// Insert a message row into the chat_messages table.
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

// Truncate the first chat message to make a concise session label.
const generateSessionName = (firstMessage: string): string => {
  const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
  if (cleanMessage.length <= 40) {
    return cleanMessage;
  }
  return cleanMessage.substring(0, 37) + '...';
};

// Save user message, query the ReAct agent, handle session name triggers, and capture service errors.
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
    // 1. Log the user's message in the database.
    await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'user',
      content,
    });

    // 2. Fetch the session message count to determine if we should generate a title.
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('session_id', selectedSession);

    if (error) {
      // Silent fail: keep going if session counting fails.
    }

    // Name the session using the first message if this is the initial exchange.
    if (messages && messages.length === 1) {
      const sessionName = generateSessionName(content);
      await updateSessionName(selectedSession, sessionName);
    }

    // 3. Process the query using the ReAct agent and log the AI's reply.
    const agentResponse = await processAgenticRequest(content, user.id, {
      isBrainMode
    });
    
    await addMessage({
      session_id: selectedSession,
      user_id: user.id,
      role: 'ai',
      content: agentResponse.message,
      metadata: {
        sources: agentResponse.sources,
        toolsUsed: agentResponse.toolsUsed
      }
    });
    
  } catch (aiError) {
    // Dissect error message to pinpoint the malfunctioning node.
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

    // Format error banner containing debugging telemetry.
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
      // Catch error silently if writing the system error itself fails.
    }
  }
};
