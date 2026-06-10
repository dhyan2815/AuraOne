import { getAIConfig } from '../config/api';
import { validateAICommand, createRepairPrompt, type AICommand } from '../utils/aiCommandSchema';
import { format } from 'date-fns';
import * as chrono from 'chrono-node';

// CRUD function imports
import { createNote, deleteNote, updateNote, getNotes } from '../hooks/useNotes';
import { createTask, deleteTask, updateTask, getTasks } from '../hooks/useTasks';
import { createEvent, deleteEvent, getEvents } from '../hooks/useEvents';

import { callGeminiAPI, callOpenRouterAPI, SERVICE_CONFIG } from './llmService';

// Get AI configuration
const AI_CONFIG = getAIConfig();

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

CRITICAL FORMATTING RULES FOR CHAT MESSAGES:
When generating chat messages (especially lists or structured data), you MUST use a professional and minimalist formatting style with comprehensive bold and italic text effects so the overall response signal is high.
For example, when listing items, use EXACTLY this format:
- **Category Name:** *e.g., example item 1, example item 2*

Always use ISO date format (YYYY-MM-DD) for dates and 24-hour time format (HH:mm) for times.`;

/**
 * @deprecated Use agentOrchestrator.processAgenticRequest instead.
 * Parse AI response and validate
 */
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
        return await handleUpdate(type, data);
      case 'delete':
        return await handleDelete(type, data);
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
      const taskData = (data.task || data) as Record<string, unknown>;
      const parsedDate = taskData.dueDate ? chrono.parseDate(taskData.dueDate as string) : null;
      
      const taskDataToSave = {
        title: (taskData.title || taskData.task) as string,
        description: (taskData.description as string) || '',
        due_date: parsedDate ? parsedDate.toISOString() : undefined,
        completed: false,
        priority: ((taskData.priority as string) || 'medium') as 'low' | 'medium' | 'high',
      };
      
      await createTask(userId, taskDataToSave);
      return `Task "${taskDataToSave.title}" created successfully ✅`;
    }
    
    case 'note': {
      const noteData = (data.note || data) as Record<string, unknown>;
      await createNote(userId, {
        title: (noteData.title || 'New Note') as string,
        content: (noteData.content as string) || '',
        tags: (noteData.tags as string[]) || [],
        is_archived: false,
      });
      return `Note "${noteData.title as string}" created successfully ✅`;
    }
    
    case 'event': {
      const eventData = (data.event || data) as Record<string, unknown>;
      const rawDate = (eventData.date || eventData.start_time || eventData.time) as string;
      const parsedDate = chrono.parseDate(rawDate);
      if (!parsedDate) throw new Error('Invalid event date');
      
      await createEvent(userId, {
        title: (eventData.title as string) || 'New Event',
        start_time: parsedDate.toISOString(),
        end_time: null,
        description: (eventData.description as string) || null,
      });
      return `Event "${eventData.title as string}" created successfully ✅`;
    }
    
    default:
      throw new Error(`Unknown create type: ${type}`);
  }
}

// Read operations
async function handleRead(type: string, _data: Record<string, unknown>, userId: string): Promise<string> {
  switch (type) {
    case 'task': {
      const tasks = await getTasks(userId);
      if (tasks.length === 0) return 'No tasks found 📭';
      return 'Your Tasks:\n' + tasks.map(t => `- ${t.title}${t.due_date ? ` (${format(new Date(t.due_date), 'MMM dd')})` : ''}`).join('\n');
    }
    
    case 'note': {
      const notes = await getNotes(userId);
      if (notes.length === 0) return 'No notes found 📝';
      return 'Your Notes:\n' + notes.map(n => `- ${n.title}`).join('\n');
    }
    
    case 'event': {
      const events = await getEvents(userId);
      if (events.length === 0) return 'No events found 🗓️';
      return 'Your Events:\n' + events.map(e => `- ${e.title} (${format(new Date(e.start_time), 'MMM dd HH:mm')})`).join('\n');
    }
    
    default:
      throw new Error(`Unknown read type: ${type}`);
  }
}

// Update operations
async function handleUpdate(type: string, data: Record<string, unknown>): Promise<string> {
  const { id } = data;
  
  if (!id || typeof id !== 'string') {
    throw new Error('ID is required for update operations');
  }
  
  switch (type) {
    case 'task': {
      const taskUpdates = (data.task || data) as Record<string, unknown>;
      await updateTask(id, taskUpdates);
      return `Task updated successfully ✅`;
    }
    
    case 'note': {
      const noteUpdates = (data.note || data) as Record<string, unknown>;
      await updateNote(id, noteUpdates);
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
async function handleDelete(type: string, data: Record<string, unknown>): Promise<string> {
  const { id } = data;
  
  if (!id || typeof id !== 'string') {
    throw new Error('ID is required for delete operations');
  }
  
  switch (type) {
    case 'task':
      await deleteTask(id);
      return 'Task deleted successfully 🗑️';
    
    case 'note':
      await deleteNote(id);
      return 'Note deleted successfully 🗑️';
    
    case 'event':
      await deleteEvent(id);
      return 'Event deleted successfully 🗑️';
    
    default:
      throw new Error(`Unknown delete type: ${type}`);
  }
}

/**
 * @deprecated Use agentOrchestrator.processAgenticRequest instead.
 * Main AI service function (Legacy path)
 */
export async function processAIRequest(
  userPrompt: string, 
  userId: string,
  options?: {
    maxRetries?: number;
    mode?: 'command' | 'brain';
  }
): Promise<string> {
  const maxRetries = options?.maxRetries || SERVICE_CONFIG.MAX_RETRIES;
  const mode = options?.mode || 'command';

  // Immediate brain mode routing (always uses Open Router)
  if (mode === 'brain') {
    return await callOpenRouterAPI(userPrompt);
  }

  let lastError: Error | null = null;

  // Try Gemini first, fall back to OpenRouter on failure
  const models = ['gemini'];
  
  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 1. Call Gemini API
        const rawResponse = await callGeminiAPI(userPrompt, SYSTEM_PROMPT);
        
        // 2. Parse and validate response
        const command = await parseAndValidateResponse(rawResponse);
        
        // 3. Execute CRUD operation
        return await executeCRUDOperation(command, userId);
        
      } catch (error) {
        lastError = error as Error;
          
        const isGeminiFailure = model === 'gemini' && (lastError.message.includes('429') || lastError.message.includes('401') || lastError.message.includes('timeout'));
        const isParsingFailure = lastError.message.includes('Failed to parse AI response');

        if (isGeminiFailure || isParsingFailure) {
          try {
            const fallbackResponse = await callOpenRouterAPI(userPrompt, SYSTEM_PROMPT);
            
            try {
              const command = await parseAndValidateResponse(fallbackResponse);
              return await executeCRUDOperation(command, userId);
            } catch {
              return fallbackResponse;
            }
          } catch {
              // Continue
            }
        }

        if (isParsingFailure && attempt < maxRetries) {
          try {
            const repairPrompt = createRepairPrompt(userPrompt, lastError.message);
            const repairResponse = await callGeminiAPI(repairPrompt, SYSTEM_PROMPT);

            const command = await parseAndValidateResponse(repairResponse);
            return await executeCRUDOperation(command, userId);
          } catch {
            // Continue
          }
        }
        
        if (attempt === maxRetries) break;
        await new Promise(r => setTimeout(r, SERVICE_CONFIG.BACKOFF_MS * attempt));
      }
    }
  }
  
  throw new Error(`Critical Intelligence Failure: ${lastError?.message || 'Unknown error'}`);
}

export { AI_CONFIG, SERVICE_CONFIG };
