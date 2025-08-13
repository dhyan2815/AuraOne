import { getAIConfig } from '../config/api';
import { validateAICommand, createRepairPrompt, type AICommand } from '../utils/aiCommandSchema';
import { format } from 'date-fns';
import * as chrono from 'chrono-node';

// CRUD function imports
import { createNote, deleteNote, updateNote, getNotes } from '../hooks/useNotes';
import { createTask, deleteTask, updateTask, getTasks } from '../hooks/useTasks';
import { addEvent, deleteEvent, getEvents } from '../hooks/useEvents';

// Get AI configuration
const AI_CONFIG = getAIConfig();

// Service configuration
const SERVICE_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 15000,
};

// System prompt for consistent AI behavior
const SYSTEM_PROMPT = `You are Aura, a helpful AI assistant that manages tasks, notes, and events. 

IMPORTANT: You must respond with ONLY valid JSON. No explanations, markdown, or text outside the JSON object.

For any user request that involves creating, reading, updating, or deleting tasks, notes, or events, respond with this exact JSON structure:

{
  "action": "create|read|update|delete",
  "type": "task|note|event",
  "data": { ... }
}

Examples:
- "Remind me to buy milk tomorrow" → {"action": "create", "type": "task", "data": {"task": {"title": "Buy milk", "dueDate": "2024-01-15"}}}
- "Show my tasks" → {"action": "read", "type": "task", "data": {}}
- "Delete the meeting with John" → {"action": "delete", "type": "event", "data": {"id": "event_id"}}

For general conversation (greetings, questions, casual chat), respond with: {"action": "chat", "type": "general", "data": {"message": "your helpful response here"}}

Examples of general conversation:
- "Hello" → {"action": "chat", "type": "general", "data": {"message": "Hello! How can I help you today?"}}
- "How are you?" → {"action": "chat", "type": "general", "data": {"message": "I'm doing well, thank you! I'm here to help you manage your tasks, notes, and events."}}
- "What can you do?" → {"action": "chat", "type": "general", "data": {"message": "I can help you create and manage tasks, notes, and events. Just ask me to create a task, add a note, or schedule an event!"}}

Always use ISO date format (YYYY-MM-DD) for dates and 24-hour time format (HH:mm) for times.`;

// Gemini API call
async function callGeminiAPI(prompt: string): Promise<string> {
  if (!AI_CONFIG.gemini.enabled) {
    throw new Error('Gemini API not configured or disabled');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(
      `${AI_CONFIG.gemini.apiUrl}/models/${AI_CONFIG.gemini.model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + prompt + '\n\nAura:' }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
        signal: controller.signal,
      }
    );

        clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Gemini API request timed out');
    }
    throw error;
  }
}

// Qwen API call
async function callQwenAPI(prompt: string): Promise<string> {
  if (!AI_CONFIG.qwen.enabled || !AI_CONFIG.qwen.endpoint) {
    throw new Error('Qwen API not available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(AI_CONFIG.qwen.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.qwen.model,
        stream: false,
        prompt: SYSTEM_PROMPT + '\n\nUser: ' + prompt + '\n\nAura:',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.response;
    
    if (!text) {
      throw new Error('No response from Qwen');
    }

    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Qwen API request timed out');
    }
    throw error;
  }
}

// Parse AI response and validate
async function parseAndValidateResponse(response: string): Promise<AICommand> {
  try {
    // Clean response
    const cleaned = response.replace(/```json|```/g, '').trim();
    
    // Try to parse JSON
    const parsed = JSON.parse(cleaned);
    
    // Validate with Zod schema
    const validated = validateAICommand(parsed);
    return validated;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Execute CRUD operations
async function executeCRUDOperation(command: AICommand, userId: string): Promise<string> {
  const { action, type, data } = command;

  try {
    switch (action) {
      case 'create':
        return await handleCreate(type, data, userId);
      case 'read':
        return await handleRead(type, data, userId);
      case 'update':
        return await handleUpdate(type, data, userId);
      case 'delete':
        return await handleDelete(type, data, userId);
      case 'chat': {
        // Handle different possible data structures
        let message = '';
        if (typeof data === 'object' && data !== null) {
          if ('message' in data && typeof data.message === 'string') {
            message = data.message;
          } else if (typeof data === 'string') {
            message = data;
          }
        }
        
        return message || 'I understand. How can I help you?';
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    throw new Error(`CRUD operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create operations
async function handleCreate(type: string, data: Record<string, unknown>, userId: string): Promise<string> {
  switch (type) {
    case 'task': {
      const taskData = data.task as Record<string, unknown>;
      const parsedDate = taskData.dueDate ? chrono.parseDate(taskData.dueDate as string) : null;
      
      const taskDataToSave = {
        title: taskData.title as string,
        description: (taskData.description as string) || '',
        dueDate: parsedDate ? format(parsedDate, 'yyyy-MM-dd') : '',
        dueTime: parsedDate ? format(parsedDate, 'HH:mm') : '',
        completed: 'due' as const,
        priority: ((taskData.priority as string) || 'medium') as 'low' | 'medium' | 'high',
        createdAt: new Date().toISOString(),
      };
      
      await createTask(userId, taskDataToSave);
      return `Task "${taskData.title as string}" created successfully ✅`;
    }
    
    case 'note': {
      const noteData = data.note as Record<string, unknown>;
      await createNote(userId, {
        title: noteData.title as string,
        content: noteData.content as string,
        createdAt: new Date().toISOString(),
        tags: (noteData.tags as string[]) || [],
        starred: (noteData.starred as boolean) || false,
        pinned: (noteData.pinned as boolean) || false,
      });
      return `Note "${noteData.title as string}" created successfully ✅`;
    }
    
    case 'event': {
      const eventData = data.event as Record<string, unknown>;
      const parsedDate = chrono.parseDate(eventData.date as string);
      if (!parsedDate) throw new Error('Invalid event date');
      
      await addEvent(userId, eventData.title as string, format(parsedDate, 'HH:mm'), parsedDate);
      return `Event "${eventData.title as string}" created successfully ✅`;
    }
    
    default:
      throw new Error(`Unknown create type: ${type}`);
  }
}

// Read operations
async function handleRead(type: string, data: Record<string, unknown>, userId: string): Promise<string> {
  switch (type) {
    case 'task': {
      const tasks = await getTasks(userId);
      if (tasks.length === 0) return 'No tasks found 📭';
      return 'Your Tasks:\n' + tasks.map(t => `- ${t.title}${t.dueDate ? ` (${t.dueDate})` : ''}`).join('\n');
    }
    
    case 'note': {
      const notes = await getNotes(userId);
      if (notes.length === 0) return 'No notes found 📝';
      return 'Your Notes:\n' + notes.map(n => `- ${n.title}`).join('\n');
    }
    
    case 'event': {
      const events = await getEvents(userId);
      if (events.length === 0) return 'No events found 🗓️';
      return 'Your Events:\n' + events.map(e => `- ${e.title} (${e.date})`).join('\n');
    }
    
    default:
      throw new Error(`Unknown read type: ${type}`);
  }
}

// Update operations
async function handleUpdate(type: string, data: Record<string, unknown>, userId: string): Promise<string> {
  const { id, ...updateData } = data;
  
  if (!id || typeof id !== 'string') {
    throw new Error('ID is required for update operations');
  }
  
  switch (type) {
    case 'task': {
      const taskUpdates = data.task || {};
      await updateTask(userId, id, taskUpdates as Record<string, unknown>);
      return `Task updated successfully ✅`;
    }
    
    case 'note': {
      const noteUpdates = data.note || {};
      await updateNote(userId, id, noteUpdates as Record<string, unknown>);
      return `Note updated successfully ✅`;
    }
    
    case 'event': {
      // Note: Events don't have update functionality in current hooks
      throw new Error('Event updates not yet implemented');
    }
    
    default:
      throw new Error(`Unknown update type: ${type}`);
  }
}

// Delete operations
async function handleDelete(type: string, data: Record<string, unknown>, userId: string): Promise<string> {
  const { id } = data;
  
  if (!id || typeof id !== 'string') {
    throw new Error('ID is required for delete operations');
  }
  
  switch (type) {
    case 'task':
      await deleteTask(userId, id);
      return 'Task deleted successfully 🗑️';
    
    case 'note':
      await deleteNote(userId, id);
      return 'Note deleted successfully 🗑️';
    
    case 'event':
      await deleteEvent(userId, id);
      return 'Event deleted successfully 🗑️';
    
    default:
      throw new Error(`Unknown delete type: ${type}`);
  }
}

// Main AI service function
export async function processAIRequest(
  userPrompt: string, 
  userId: string,
  options?: {
    preferModel?: 'gemini' | 'qwen';
    maxRetries?: number;
  }
): Promise<string> {
  const maxRetries = options?.maxRetries || SERVICE_CONFIG.MAX_RETRIES;
  const preferModel = options?.preferModel || 'gemini';
  
  let lastError: Error | null = null;
  
  // Try Gemini first (or Qwen if preferred)
  const models = preferModel === 'gemini' 
    ? ['gemini', 'qwen'] 
    : ['qwen', 'gemini'];
  
  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Call AI model
        const response = model === 'gemini' 
          ? await callGeminiAPI(userPrompt)
          : await callQwenAPI(userPrompt);
        
        // Parse and validate response
        const command = await parseAndValidateResponse(response);
        
        // Execute CRUD operation
        const result = await executeCRUDOperation(command, userId);
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
          
          // If it's a validation error, try repair
          if (error instanceof Error && error.message.includes('Failed to parse AI response')) {
            try {
              const repairPrompt = createRepairPrompt(userPrompt, error.message);
              const repairResponse = model === 'gemini' 
                ? await callGeminiAPI(repairPrompt)
                : await callQwenAPI(repairPrompt);
              
              const command = await parseAndValidateResponse(repairResponse);
              const result = await executeCRUDOperation(command, userId);
              
              return result;
            } catch (repairError) {
              // Repair failed, continue to next attempt
            }
          }
        
        // If this is the last attempt for this model, break to try next model
        if (attempt === maxRetries) break;
      }
    }
  }
  
  // All attempts failed
  throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Export configuration for external use
export { AI_CONFIG, SERVICE_CONFIG };
