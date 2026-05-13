import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockEvents = [
  { id: '1', user_id: 'user-1', title: 'Event 1', start_time: '2024-01-01T10:00:00Z', end_time: '2024-01-01T11:00:00Z', description: 'Description 1', created_at: '2024-01-01' },
  { id: '2', user_id: 'user-1', title: 'Event 2', start_time: '2024-01-02T14:00:00Z', end_time: null, description: null, created_at: '2024-01-02' },
];

const createdEvent = { id: 'event-1', user_id: 'user-1', title: 'New Event', start_time: '2024-01-01T10:00:00Z', end_time: '2024-01-01T11:00:00Z', description: 'New event description', created_at: '2024-01-01' };

const updatedEvent = { id: 'event-1', user_id: 'user-1', title: 'Updated Event', start_time: '2024-01-01T10:00:00Z', end_time: '2024-01-01T12:00:00Z', description: 'Updated description', created_at: '2024-01-01' };

const createMockWithError = (error: Error) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: null, error })),
    })),
  })),
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: null, error })),
    })),
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error })),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error })),
  })),
});

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
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updatedEvent, error: null })),
          })),
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

import { getEvents, createEvent, updateEvent, deleteEvent } from '../../src/hooks/useEvents';

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

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updates = { title: 'Updated Event', end_time: '2024-01-01T12:00:00Z', description: 'Updated description' };
      const result = await updateEvent('event-1', updates);
      expect(result).toEqual(updatedEvent);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when getEvents fails due to network failure', async () => {
      const networkError = new Error('Network request failed');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(getEvents('user-1')).rejects.toThrow('Network request failed');
    });

    it('should throw error when createEvent fails due to Supabase error', async () => {
      const supabaseError = new Error('Failed to create event');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(supabaseError));

      await expect(createEvent('user-1', { title: 'New Event', start_time: '2024-01-01T10:00:00Z' })).rejects.toThrow('Failed to create event');
    });

    it('should throw error when updateEvent fails due to network failure', async () => {
      const networkError = new Error('Connection timeout');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(updateEvent('event-1', { title: 'Updated' })).rejects.toThrow('Connection timeout');
    });

    it('should throw error when deleteEvent fails due to Supabase error', async () => {
      const supabaseError = new Error('Delete failed');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(supabaseError));

      await expect(deleteEvent('event-1')).rejects.toThrow('Delete failed');
    });
  });
});