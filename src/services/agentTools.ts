// Gemini Function-Calling Tool Definitions — Declares and dispatches executable actions for note, task, and event management.

import { createNote, getNotes } from '../hooks/useNotes';
import { createTask, updateTask, getTasks } from '../hooks/useTasks';
import { createEvent, getEvents } from '../hooks/useEvents';
import { retrieveContext } from './ragRetrievalService';
import * as chrono from 'chrono-node';

// JSON schema declarations for tools exposed to the Gemini model in function-calling mode.
export const AGENT_TOOLS = [
  // Semantic search tool for context retrieval.
  {
    name: 'search_knowledge_base',
    description: 'Search the user\'s personal knowledge base (notes, tasks, events) for relevant information.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The semantic search query' },
        source_filter: { type: 'string', enum: ['note', 'task', 'event', 'all'], description: 'Filter by source type' }
      },
      required: ['query']
    }
  },
  // Task creation schema.
  {
    name: 'create_task',
    description: 'Create a new task in the user\'s workboard.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        dueDate: { type: 'string', description: 'ISO date string or natural language date' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] }
      },
      required: ['title']
    }
  },
  // Note creation schema.
  {
    name: 'create_note',
    description: 'Create a new note.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      },
      required: ['title', 'content']
    }
  },
  // Calendar event schedule schema.
  {
    name: 'schedule_event',
    description: 'Schedule a new calendar event.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        start_time: { type: 'string', description: 'ISO date string or natural language' },
        end_time: { type: 'string', description: 'ISO date string or natural language' },
        description: { type: 'string' }
      },
      required: ['title', 'start_time']
    }
  },
  // Task status and priority modifier schema.
  {
    name: 'update_task_status',
    description: 'Mark a task as completed or update its priority.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string' },
        completed: { type: 'boolean' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] }
      },
      required: ['task_id']
    }
  },
  // Listing/retrieval schema.
  {
    name: 'list_items',
    description: 'List tasks, notes, or events with optional filters.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['task', 'note', 'event'] },
        filter: { type: 'string', description: 'Optional filter keyword' }
      },
      required: ['type']
    }
  }
];

// Execute functions matched by name and process parameters using the active user context.
export async function executeTool(name: string, params: Record<string, unknown> = {}, userId: string): Promise<Record<string, unknown>> {
  switch (name) {
    // Perform vector-similarity query search.
    case 'search_knowledge_base': {
      const results = await retrieveContext(userId, String(params.query || ''));
      return {
        results: results.map(r => ({
          content: r.content,
          source: r.sourceType,
          id: r.sourceId,
          similarity: r.similarity
        }))
      };
    }

    // Insert task with natural-language date parsing.
    case 'create_task': {
      const parsedDate = params.dueDate ? chrono.parseDate(String(params.dueDate)) : null;
      const task = await createTask(userId, {
        title: String(params.title || ''),
        description: params.description ? String(params.description) : '',
        due_date: parsedDate ? parsedDate.toISOString() : undefined,
        priority: (params.priority as 'low' | 'medium' | 'high') || 'medium',
        completed: false
      });
      return { message: `Task "${task.title}" created successfully.`, task_id: task.id };
    }

    // Insert note with optional string tag array.
    case 'create_note': {
      const note = await createNote(userId, {
        title: String(params.title || ''),
        content: String(params.content || ''),
        tags: Array.isArray(params.tags) ? params.tags.map(String) : [],
        is_archived: false
      });
      return { message: `Note "${note.title}" created successfully.`, note_id: note.id };
    }

    // Schedule calendar event with start/end time text processing.
    case 'schedule_event': {
      const start = chrono.parseDate(String(params.start_time || ''));
      const end = params.end_time ? chrono.parseDate(String(params.end_time)) : null;
      if (!start) throw new Error('Invalid start time');
      
      const event = await createEvent(userId, {
        title: String(params.title || ''),
        start_time: start.toISOString(),
        end_time: end ? end.toISOString() : null,
        description: params.description ? String(params.description) : null
      });
      return { message: `Event "${event.title}" scheduled successfully.`, event_id: event.id };
    }

    // Update target task's completion check or level of urgency.
    case 'update_task_status': {
      const updates: Partial<import('../hooks/useTasks').NewTask> = {};
      if (params.completed !== undefined) updates.completed = Boolean(params.completed);
      if (params.priority) updates.priority = params.priority as 'low' | 'medium' | 'high';
      
      await updateTask(String(params.task_id), updates);
      return { message: `Task ${params.task_id} updated.` };
    }

    // Retrieve list summaries, capped at 10 items for visual efficiency.
    case 'list_items': {
      if (params.type === 'task') {
        const tasks = await getTasks(userId);
        return { tasks: tasks.slice(0, 10) };
      } else if (params.type === 'note') {
        const notes = await getNotes(userId);
        return { notes: notes.slice(0, 10) };
      } else if (params.type === 'event') {
        const events = await getEvents(userId);
        return { events: events.slice(0, 10) };
      }
      return { error: 'Unknown type' };
    }

    default:
      throw new Error(`Tool not found: ${name}`);
  }
}
