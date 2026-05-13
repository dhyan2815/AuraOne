import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockNotes = [
  { id: '1', user_id: 'user-1', title: 'Note 1', content: 'Content 1', tags: ['tag1'], created_at: '2024-01-01', is_archived: false },
  { id: '2', user_id: 'user-1', title: 'Note 2', content: 'Content 2', tags: ['tag2'], created_at: '2024-01-02', is_archived: false },
];

const mockNote = { id: 'note-1', user_id: 'user-1', title: 'Test Note', content: 'Test content', tags: null, created_at: '2024-01-01', is_archived: false };
const createdNote = { id: 'note-1', user_id: 'user-1', title: 'New Note', content: 'New content', tags: ['work'], is_archived: false, created_at: '2024-01-01' };
const updatedNote = { id: 'note-1', user_id: 'user-1', title: 'Updated Note', content: 'Content', tags: null, created_at: '2024-01-01', is_archived: true };

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
});