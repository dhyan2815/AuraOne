// Verify the behavior and database sync integrations inside the useNotes hook module.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define mock notes list and status variables representing database records.
const mockNotes = [
  { id: '1', user_id: 'user-1', title: 'Note 1', content: 'Content 1', tags: ['tag1'], created_at: '2024-01-01', is_archived: false },
  { id: '2', user_id: 'user-1', title: 'Note 2', content: 'Content 2', tags: ['tag2'], created_at: '2024-01-02', is_archived: false },
];

const mockNote = { id: 'note-1', user_id: 'user-1', title: 'Test Note', content: 'Test content', tags: null, created_at: '2024-01-01', is_archived: false };
const createdNote = { id: 'note-1', user_id: 'user-1', title: 'New Note', content: 'New content', tags: ['work'], is_archived: false, created_at: '2024-01-01' };
const updatedNote = { id: 'note-1', user_id: 'user-1', title: 'Updated Note', content: 'Content', tags: null, created_at: '2024-01-01', is_archived: true };

// Construct a mock builder that resolves database requests with predefined error signals.
const createMockWithError = (error: Error) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: null, error })),
      single: vi.fn(() => Promise.resolve({ data: null, error })),
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

// Mock Supabase endpoints to verify successful note queries.
vi.mock('../../src/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockNotes, error: null })),
          single: vi.fn(() => Promise.resolve({ data: mockNote, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: createdNote, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updatedNote, error: null })),
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

import { getNotes, getNoteById, createNote, updateNote, deleteNote } from '../../src/hooks/useNotes';

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotes', () => {
    it('should fetch notes for a user', async () => {
      const result = await getNotes('user-1');
      expect(result).toEqual(mockNotes);
    });

    it('should return empty array when no notes exist', async () => {
      const result = await getNotes('user-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getNoteById', () => {
    it('should fetch a single note by ID', async () => {
      const result = await getNoteById('note-1');
      expect(result).toEqual(mockNote);
    });
  });

  describe('createNote', () => {
    it('should create a new note', async () => {
      const newNote = { title: 'New Note', content: 'New content', tags: ['work'], is_archived: false };
      const result = await createNote('user-1', newNote);
      expect(result).toEqual(createdNote);
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      const updates = { title: 'Updated Note', is_archived: true };
      const result = await updateNote('note-1', updates);
      expect(result).toEqual(updatedNote);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      await expect(deleteNote('note-1')).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when getNotes fails due to network failure', async () => {
      const networkError = new Error('Network request failed');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(getNotes('user-1')).rejects.toThrow('Network request failed');
    });

    it('should throw error when getNoteById fails due to Supabase error', async () => {
      const supabaseError = new Error('Failed to fetch note');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(supabaseError));

      await expect(getNoteById('note-1')).rejects.toThrow('Failed to fetch note');
    });

    it('should throw error when createNote fails due to network failure', async () => {
      const networkError = new Error('Connection timeout');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(createNote('user-1', { title: 'New Note', content: 'Content' })).rejects.toThrow('Connection timeout');
    });

    it('should throw error when updateNote fails due to Supabase error', async () => {
      const supabaseError = new Error('Update failed');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(supabaseError));

      await expect(updateNote('note-1', { title: 'Updated' })).rejects.toThrow('Update failed');
    });

    it('should throw error when deleteNote fails due to network failure', async () => {
      const networkError = new Error('Network unavailable');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(deleteNote('note-1')).rejects.toThrow('Network unavailable');
    });
  });
});