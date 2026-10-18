import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/hooks/useNotes', () => ({ createNote: vi.fn(), getNotes: vi.fn(), updateNote: vi.fn(), deleteNote: vi.fn() }));
vi.mock('../../src/hooks/useTasks', () => ({ createTask: vi.fn(), getTasks: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn() }));
vi.mock('../../src/hooks/useEvents', () => ({
  createEvent: vi.fn(), updateEvent: vi.fn(), deleteEvent: vi.fn(),
  getEvents: vi.fn().mockResolvedValue([
    { id: 'e1', title: 'Standup', start_time: '2026-10-19T10:00:00', end_time: '2026-10-19T11:00:00', description: null },
  ]),
}));
vi.mock('../../src/services/ragRetrievalService', () => ({ retrieveContext: vi.fn() }));

import { AGENT_TOOLS, executeTool } from '../../src/services/agentTools';
import { deleteEvent } from '../../src/hooks/useEvents';

describe('agentTools', () => {
  it('declares gemini-safe schemas', () => {
    expect(AGENT_TOOLS.length).toBeGreaterThan(8);
    expect(JSON.stringify(AGENT_TOOLS)).not.toMatch(/\$schema|additionalProperties/);
  });

  it('returns a recoverable error for bad args', async () => {
    const r = await executeTool('create_task', {}, 'u1');
    expect(String(r.error)).toMatch(/Invalid arguments/);
  });

  it('delete_item only requests confirmation', async () => {
    const r = await executeTool('delete_item', { type: 'event', id: 'e1', title: 'Standup' }, 'u1');
    expect(r.pending_confirmation).toBe(true);
    expect(deleteEvent).not.toHaveBeenCalled();
  });

  it('find_free_slots skips busy time', async () => {
    const r = await executeTool('find_free_slots', { date: '2026-10-19', duration_minutes: 60 }, 'u1');
    const slots = r.slots as Array<{ start: string; end: string }>;
    expect(slots).toHaveLength(2); // 9-10 and 11-18
  });
});
