// Agent tool registry — One table of zod-validated tools (CRUD for tasks, notes, events, plus calendar views) that doubles as the Gemini function-declaration source.

import { z } from 'zod';
import * as chrono from 'chrono-node';
import { createNote, getNotes, updateNote, deleteNote } from '../hooks/useNotes';
import { createTask, updateTask, getTasks, deleteTask } from '../hooks/useTasks';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../hooks/useEvents';
import { retrieveContext } from './ragRetrievalService';

export type ItemType = 'task' | 'note' | 'event';
type Priority = 'low' | 'medium' | 'high';

// Returned by delete_item instead of deleting; the UI must confirm before performDelete runs.
export interface PendingAction {
  action: 'delete';
  type: ItemType;
  id: string;
  label: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

const itemType = z.enum(['task', 'note', 'event']);
const priority = z.enum(['low', 'medium', 'high']);
const when = z.string().describe('ISO date string or natural language ("tomorrow 3pm")');

const parseWhen = (value: string, field: string): Date => {
  const d = chrono.parseDate(value);
  if (!d) throw new Error(`Could not understand ${field}: "${value}"`);
  return d;
};

const dayBounds = (d: Date): [Date, Date] => {
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = new Date(d); end.setHours(23, 59, 59, 999);
  return [start, end];
};

const matches = (filter: string | undefined, ...fields: Array<string | null | undefined>) =>
  !filter || fields.some(f => f?.toLowerCase().includes(filter.toLowerCase()));

interface Tool<S extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  schema: S;
  run: (args: z.infer<S>, userId: string) => Promise<Record<string, unknown>>;
}

const tool = <S extends z.ZodType>(t: Tool<S>) => t as unknown as Tool;

const TOOLS: Tool[] = [
  tool({
    name: 'search_knowledge_base',
    description: "Semantic search over the user's notes, tasks and events. Use for questions about their past, plans or existing items.",
    schema: z.object({
      query: z.string().describe('The semantic search query'),
      source_filter: z.enum(['note', 'task', 'event', 'all']).optional()
    }),
    run: async ({ query, source_filter }, userId) => {
      const results = await retrieveContext(userId, query);
      return {
        results: results
          .filter(r => !source_filter || source_filter === 'all' || r.sourceType === source_filter)
          .map(r => ({ content: r.content, source: r.sourceType, id: r.sourceId, similarity: r.similarity }))
      };
    }
  }),

  tool({
    name: 'list_items',
    description: 'List tasks, notes or events (max 20, with ids). Use to find an id before update/delete.',
    schema: z.object({
      type: itemType,
      filter: z.string().optional().describe('Keyword matched against title/content'),
      include_completed: z.boolean().optional().describe('Tasks only; default false')
    }),
    run: async ({ type, filter, include_completed }, userId) => {
      if (type === 'task') {
        const items = (await getTasks(userId)).filter(t => matches(filter, t.title, t.description) && (include_completed || !t.completed));
        return { tasks: items.slice(0, 20) };
      }
      if (type === 'note') {
        const items = (await getNotes(userId)).filter(n => matches(filter, n.title, n.content));
        return { notes: items.slice(0, 20) };
      }
      const items = (await getEvents(userId)).filter(e => matches(filter, e.title, e.description));
      return { events: items.slice(0, 20) };
    }
  }),

  tool({
    name: 'create_task',
    description: "Create a task on the user's workboard.",
    schema: z.object({ title: z.string(), description: z.string().optional(), dueDate: when.optional(), priority: priority.optional() }),
    run: async (a, userId) => {
      const task = await createTask(userId, {
        title: a.title,
        description: a.description ?? '',
        due_date: a.dueDate ? parseWhen(a.dueDate, 'dueDate').toISOString() : undefined,
        priority: (a.priority as Priority) ?? 'medium',
        completed: false
      });
      return { message: `Task "${task.title}" created.`, task_id: task.id };
    }
  }),

  tool({
    name: 'update_task',
    description: 'Edit a task: title, description, due date, priority or completion.',
    schema: z.object({
      task_id: z.string(), title: z.string().optional(), description: z.string().optional(),
      dueDate: when.optional(), priority: priority.optional(), completed: z.boolean().optional()
    }),
    run: async ({ task_id, dueDate, ...rest }) => {
      const updates: Record<string, unknown> = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
      if (dueDate) updates.due_date = parseWhen(dueDate, 'dueDate').toISOString();
      const task = await updateTask(task_id, updates);
      return { message: `Task "${task.title}" updated.`, task_id };
    }
  }),

  tool({
    name: 'create_note',
    description: 'Create a note.',
    schema: z.object({ title: z.string(), content: z.string(), tags: z.array(z.string()).optional() }),
    run: async (a, userId) => {
      const note = await createNote(userId, { title: a.title, content: a.content, tags: a.tags ?? [], is_archived: false });
      return { message: `Note "${note.title}" created.`, note_id: note.id };
    }
  }),

  tool({
    name: 'update_note',
    description: 'Edit a note: title, content, tags or archive state.',
    schema: z.object({
      note_id: z.string(), title: z.string().optional(), content: z.string().optional(),
      tags: z.array(z.string()).optional(), is_archived: z.boolean().optional()
    }),
    run: async ({ note_id, ...rest }) => {
      const note = await updateNote(note_id, Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)));
      return { message: `Note "${note.title}" updated.`, note_id };
    }
  }),

  tool({
    name: 'schedule_event',
    description: 'Schedule a calendar event.',
    schema: z.object({ title: z.string(), start_time: when, end_time: when.optional(), description: z.string().optional() }),
    run: async (a, userId) => {
      const event = await createEvent(userId, {
        title: a.title,
        start_time: parseWhen(a.start_time, 'start_time').toISOString(),
        end_time: a.end_time ? parseWhen(a.end_time, 'end_time').toISOString() : null,
        description: a.description ?? null
      });
      return { message: `Event "${event.title}" scheduled.`, event_id: event.id };
    }
  }),

  tool({
    name: 'update_event',
    description: 'Edit or reschedule a calendar event.',
    schema: z.object({
      event_id: z.string(), title: z.string().optional(), start_time: when.optional(),
      end_time: when.optional(), description: z.string().optional()
    }),
    run: async ({ event_id, start_time, end_time, ...rest }) => {
      const updates: Record<string, unknown> = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
      if (start_time) updates.start_time = parseWhen(start_time, 'start_time').toISOString();
      if (end_time) updates.end_time = parseWhen(end_time, 'end_time').toISOString();
      const event = await updateEvent(event_id, updates);
      return { message: `Event "${event.title}" updated.`, event_id };
    }
  }),

  tool({
    name: 'get_agenda',
    description: 'Calendar view: events and tasks due between two dates, sorted by time.',
    schema: z.object({ from: when, to: when.optional().describe('Defaults to end of the "from" day') }),
    run: async ({ from, to }, userId) => {
      const start = dayBounds(parseWhen(from, 'from'))[0];
      const end = to ? dayBounds(parseWhen(to, 'to'))[1] : dayBounds(start)[1];
      const inRange = (iso?: string | null) => !!iso && new Date(iso) >= start && new Date(iso) <= end;
      const [events, tasks] = await Promise.all([getEvents(userId), getTasks(userId)]);
      return {
        range: [start.toISOString(), end.toISOString()],
        events: events.filter(e => inRange(e.start_time)).sort((a, b) => a.start_time.localeCompare(b.start_time)),
        tasks_due: tasks.filter(t => !t.completed && inRange(t.due_date))
      };
    }
  }),

  tool({
    name: 'find_free_slots',
    description: 'Find free time gaps on a given day between working hours.',
    schema: z.object({
      date: when, duration_minutes: z.number().optional().describe('Minimum gap length; default 30'),
      day_start_hour: z.number().optional(), day_end_hour: z.number().optional()
    }),
    run: async ({ date, duration_minutes = 30, day_start_hour = 9, day_end_hour = 18 }, userId) => {
      const day = parseWhen(date, 'date');
      const [dayStart, dayEnd] = dayBounds(day);
      const from = new Date(dayStart); from.setHours(day_start_hour);
      const to = new Date(dayStart); to.setHours(day_end_hour);
      const busy = (await getEvents(userId))
        .filter(e => new Date(e.start_time) <= dayEnd && new Date(e.end_time ?? e.start_time) >= dayStart)
        .map(e => [new Date(e.start_time), new Date(e.end_time ?? e.start_time)] as const)
        .sort((a, b) => a[0].getTime() - b[0].getTime());

      const slots: Array<{ start: string; end: string }> = [];
      let cursor = from;
      for (const [s, e] of [...busy, [to, to] as const]) {
        const gapEnd = s < to ? s : to;
        if ((gapEnd.getTime() - cursor.getTime()) / 60000 >= duration_minutes) {
          slots.push({ start: cursor.toISOString(), end: gapEnd.toISOString() });
        }
        if (e > cursor) cursor = e;
      }
      return { date: dayStart.toDateString(), slots };
    }
  }),

  tool({
    name: 'delete_item',
    description: 'Request deletion of a task, note or event. Nothing is deleted until the user confirms in the UI, so tell them to confirm.',
    schema: z.object({ type: itemType, id: z.string(), title: z.string().optional().describe('Human-readable label for the confirm card') }),
    run: async ({ type, id, title }) => {
      const pending: PendingAction = { action: 'delete', type, id, label: title ?? `${type} ${id}`, status: 'pending' };
      return { pending_confirmation: true, pending, message: `Awaiting user confirmation to delete ${pending.label}.` };
    }
  })
];

// Gemini rejects $schema / additionalProperties, so strip them from zod's JSON schema.
const toGeminiSchema = (node: unknown): unknown => {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).filter(([k]) => k !== '$schema' && k !== 'additionalProperties').map(([k, v]) => [k, toGeminiSchema(v)])
    );
  }
  return node;
};

export const AGENT_TOOLS = TOOLS.map(t => ({
  name: t.name,
  description: t.description,
  parameters: toGeminiSchema(z.toJSONSchema(t.schema)) as Record<string, unknown>
}));

export const TOOL_NAMES = TOOLS.map(t => t.name);

// Validates args against the tool's schema; a bad call returns {error} so the model can self-correct.
export async function executeTool(name: string, params: Record<string, unknown> = {}, userId: string): Promise<Record<string, unknown>> {
  const t = TOOLS.find(x => x.name === name);
  if (!t) return { error: `Unknown tool "${name}". Available: ${TOOL_NAMES.join(', ')}` };

  const parsed = t.schema.safeParse(params);
  if (!parsed.success) {
    return { error: `Invalid arguments for ${name}: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}` };
  }
  try {
    return await t.run(parsed.data, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// Runs a user-confirmed deletion.
export async function performDelete({ type, id }: Pick<PendingAction, 'type' | 'id'>): Promise<void> {
  if (type === 'task') await deleteTask(id);
  else if (type === 'note') await deleteNote(id);
  else await deleteEvent(id);
}
