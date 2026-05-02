import { getAIConfig } from '../config/api';
import { validateAICommand, createRepairPrompt, type AICommand } from '../utils/aiCommandSchema';
import { format } from 'date-fns';
import * as chrono from 'chrono-node';

// CRUD function imports
import { createNote, deleteNote, updateNote, getNotes } from '../hooks/useNotes';
import { createTask, deleteTask, updateTask, getTasks } from '../hooks/useTasks';
import { createEvent, deleteEvent, getEvents } from '../hooks/useEvents';

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

CRITICAL FORMATTING RULES FOR CHAT MESSAGES:
When generating chat messages (especially lists or structured data), you MUST use a professional and minimalist formatting style with comprehensive bold and italic text effects so the overall response signal is high.
For example, when listing items, use EXACTLY this format:
- **Category Name:** *e.g., example item 1, example item 2*

Examples of general conversation:
- "Hello" → {"action": "chat", "type": "general", "data": {"message": "Hello! How can I help you today?"}}
- "How are you?" → {"action": "chat", "type": "general", "data": {"message": "I'm doing well, thank you! I'm here to help you manage your tasks, notes, and events."}}
- "What can you do?" → {"action": "chat", "type": "general", "data": {"message": "I can help you create and manage tasks, notes, and events. Just ask me to create a task, add a note, or schedule an event!"}}

Always use ISO date format (YYYY-MM-DD) for dates and 24-hour time format (HH:mm) for times.`;

// Gemini API call
async function callGeminiAPI(prompt: string): Promise<string> {
  const LOCATION = "src/services/aiService.ts:callGeminiAPI";
  console.log(`--- [${LOCATION}] Initiating ---`);
  if (!AI_CONFIG.gemini.enabled) {
    console.error(`[${LOCATION}] Gemini disabled or missing keys`);
    throw new Error(`[${LOCATION}] Gemini API not configured`);
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
      const errorText = await response.text();
      console.error(`[${LOCATION}] HTTP ${response.status}:`, errorText);
      throw new Error(`[${LOCATION}] Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error(`[${LOCATION}] Empty candidate array in response`, data);
      throw new Error(`[${LOCATION}] No response candidate from Gemini`);
    }

    console.log(`[${LOCATION}] Success: Received ${text.length} chars`);
    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[${LOCATION}] Request Timed Out (${SERVICE_CONFIG.TIMEOUT_MS}ms)`);
      throw new Error(`[${LOCATION}] Gemini Hub Timeout`);
    }
    console.error(`[${LOCATION}] Exception:`, error);
    throw error;
  }
}

// Qwen API call
async function callQwenAPI(prompt: string): Promise<string> {
  const LOCATION = "src/services/aiService.ts:callQwenAPI";
  console.log(`--- [${LOCATION}] Initiating ---`);
  if (!AI_CONFIG.qwen.enabled || !AI_CONFIG.qwen.endpoint) {
    throw new Error(`[${LOCATION}] Qwen API not available`);
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
      throw new Error(`[${LOCATION}] Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.response;
    
    if (!text) {
      throw new Error(`[${LOCATION}] No response from Qwen`);
    }

    console.log(`[${LOCATION}] Success: Received ${text.length} chars`);
    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[${LOCATION}] Exception:`, error);
    throw error;
  }
}

// Open Router API call - Deep reasoning fallback
async function callOpenRouterAPI(prompt: string, systemPrompt?: string): Promise<string> {
  const LOCATION = "src/services/aiService.ts:callOpenRouterAPI";
  console.log(`--- [${LOCATION}] Initiating ---`);
  
  if (!AI_CONFIG.openRouter.enabled) {
    console.error(`[${LOCATION}] Open Router disabled or missing keys`);
    throw new Error(`[${LOCATION}] Open Router API not configured`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_CONFIG.TIMEOUT_MS * 3); // Extra time for reasoning

  try {
    const activeModel = AI_CONFIG.openRouter.model || 'openrouter/free';
    const activeSystemPrompt = systemPrompt || 'You are Aura, a professional and helpful assistant. Provide clear, concise, and helpful responses to user queries. CRITICAL FORMATTING RULES: When generating chat messages (especially lists or structured data), you MUST use a professional and minimalist formatting style with comprehensive bold and italic text effects. For example, when listing items, use this format: - **Category Name:** *e.g., example item 1, example item 2*';
    
    console.log(`[aiService] Requesting Open Router with model: ${activeModel}`);
    
    const response = await fetch(AI_CONFIG.openRouter.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openRouter.apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AuraOne',
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: activeSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[aiService] Open Router Error Data:`, errorData);
      throw new Error(`[aiService] Open Router HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`[aiService] Open Router response data:`, data);
    
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      console.error(`[aiService] Invalid response structure`, data);
      throw new Error(`[aiService] Invalid Open Router response format`);
    }

    console.log(`[aiService] Open Router response text:`, text.substring(0, 100) + '...');
    return text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[aiService] Open Router Request Timed Out`);
      throw new Error(`[aiService] Reasoning Matrix Timeout`);
    }
    console.error(`[aiService] Open Router Exception:`, error);
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
async function handleUpdate(type: string, data: Record<string, unknown>, _userId: string): Promise<string> {
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
async function handleDelete(type: string, data: Record<string, unknown>, _userId: string): Promise<string> {
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

// Main AI service function
export async function processAIRequest(
  userPrompt: string, 
  userId: string,
  options?: {
    preferModel?: 'gemini' | 'qwen';
    maxRetries?: number;
    mode?: 'command' | 'brain';
  }
): Promise<string> {
  const maxRetries = options?.maxRetries || SERVICE_CONFIG.MAX_RETRIES;
  const preferModel = options?.preferModel || 'gemini';
  const mode = options?.mode || 'command';

  // Immediate brain mode routing (always uses Open Router)
  if (mode === 'brain') {
    return await callOpenRouterAPI(userPrompt);
  }
  
  let lastError: Error | null = null;
  
  // Try models in order
  const models = preferModel === 'gemini' 
    ? ['gemini', 'qwen'] 
    : ['qwen', 'gemini'];
  
  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[aiService] Attempt ${attempt} with model ${model}`);
        
        // 1. Call primary AI model
        const rawResponse = model === 'gemini' 
          ? await callGeminiAPI(userPrompt)
          : await callQwenAPI(userPrompt);
        
        // 2. Parse and validate response
        const command = await parseAndValidateResponse(rawResponse);
        
        // 3. Execute CRUD operation
        return await executeCRUDOperation(command, userId);
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`[aiService] Attempt ${attempt} failed: ${lastError.message}`);
          
        // Immediate fallback to Open Router if Gemini is failing (likely rate limit)
        // OR if it's a parsing error (suggests Gemini is hallucinating invalid JSON)
        const isGeminiFailure = model === 'gemini' && (lastError.message.includes('429') || lastError.message.includes('error: 401') || lastError.message.includes('timeout'));
        const isParsingFailure = lastError.message.includes('Failed to parse AI response');

        if (isGeminiFailure || isParsingFailure) {
          console.log(`[aiService] Triggering Open Router Fallback (Reason: ${isGeminiFailure ? 'Model Disruption' : 'Parsing Failure'})`);
          try {
            // Fallback call with the FULL system prompt to maintain command capabilities
            const fallbackResponse = await callOpenRouterAPI(userPrompt, SYSTEM_PROMPT);
            
            try {
              // Try to parse the fallback as a command
              const command = await parseAndValidateResponse(fallbackResponse);
              return await executeCRUDOperation(command, userId);
            } catch {
              // If fallback isn't valid JSON, treat it as a direct chat response
              console.log("[aiService] Fallback returned non-JSON, returning as chat message.");
              return fallbackResponse;
            }
          } catch (fallbackError) {
            console.error("[aiService] Fallback also failed:", fallbackError);
            // Continue with next attempts/models
          }
        }

        // Handle specific repair logic for validation errors (if we haven't returned yet)
        if (isParsingFailure && attempt < maxRetries) {
          try {
            console.log("[aiService] Attempting repair prompt...");
            const repairPrompt = createRepairPrompt(userPrompt, lastError.message);
            const repairResponse = model === 'gemini' 
              ? await callGeminiAPI(repairPrompt)
              : await callQwenAPI(repairPrompt);
            
            const command = await parseAndValidateResponse(repairResponse);
            return await executeCRUDOperation(command, userId);
          } catch {
            // Repair failed, continue to next attempt
          }
        }
        
        // If this is the last attempt for this model, break to try next model
        if (attempt === maxRetries) break;
      }
    }
  }
  
  // All attempts failed
  throw new Error(`Critical Intelligence Failure: ${lastError?.message || 'Unknown error'}`);
}

// Export configuration for external use
export { AI_CONFIG, SERVICE_CONFIG };
