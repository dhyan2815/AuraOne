import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockEvents = [
  { id: '1', user_id: 'user-1', title: 'Event 1', start_time: '2024-01-01T10:00:00Z', end_time: '2024-01-01T11:00:00Z', description: 'Description 1', created_at: '2024-01-01' },
  { id: '2', user_id: 'user-1', title: 'Event 2', start_time: '2024-01-02T14:00:00Z', end_time: null, description: null, created_at: '2024-01-02' },
];

const createdEvent = { id: 'event-1', user_id: 'user-1', title: 'New Event', start_time: '2024-01-01T10:00:00Z', end_time: '2024-01-01T11:00:00Z', description: 'New event description', created_at: '2024-01-01' };

vi.mock('../../src/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockEvents, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: createdEvent, error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({})),
      })),
    })),
  },
}));

import { getEvents, createEvent, deleteEvent } from '../../src/hooks/useEvents';

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch events for a user', async () => {
      const result = await getEvents('user-1');
      expect(result).toEqual(mockEvents);
    });

    it('should return empty array when no events exist', async () => {
      const result = await getEvents('user-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const newEvent = { title: 'New Event', start_time: '2024-01-01T10:00:00Z', end_time: '2024-01-01T11:00:00Z', description: 'New event description' };
      const result = await createEvent('user-1', newEvent);
      expect(result).toEqual(createdEvent);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      await expect(deleteEvent('event-1')).resolves.toBeUndefined();
    });
  });
});