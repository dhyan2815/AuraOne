import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockTasks = [
  { id: '1', user_id: 'user-1', title: 'Task 1', completed: false, priority: 'high' },
  { id: '2', user_id: 'user-1', title: 'Task 2', completed: true, priority: 'low' },
];

const mockTask = { id: 'task-1', user_id: 'user-1', title: 'Test Task' };
const createdTask = { id: 'task-1', user_id: 'user-1', title: 'New Task', priority: 'medium' };
const updatedTask = { id: 'task-1', user_id: 'user-1', title: 'Updated Task', completed: true };

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

vi.mock('../../src/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockTasks, error: null })),
          single: vi.fn(() => Promise.resolve({ data: mockTask, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: createdTask, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updatedTask, error: null })),
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

import { getTasks, getTaskById, createTask, updateTask, deleteTask } from '../../src/hooks/useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch tasks for a user', async () => {
      const result = await getTasks('user-1');
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks exist', async () => {
      const result = await getTasks('user-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTaskById', () => {
    it('should fetch a single task by ID', async () => {
      const result = await getTaskById('task-1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'New Task', priority: 'medium' };
      const result = await createTask('user-1', newTask);
      expect(result).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updates = { title: 'Updated Task', completed: true };
      const result = await updateTask('task-1', updates);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      await expect(deleteTask('task-1')).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when getTasks fails due to network failure', async () => {
      const networkError = new Error('Network request failed');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(getTasks('user-1')).rejects.toThrow('Network request failed');
    });

    it('should throw error when getTaskById fails due to Supabase error', async () => {
      const supabaseError = new Error('Failed to fetch task');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(supabaseError));

      await expect(getTaskById('task-1')).rejects.toThrow('Failed to fetch task');
    });

    it('should throw error when createTask fails due to network failure', async () => {
      const networkError = new Error('Connection timeout');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(createTask('user-1', { title: 'New Task' })).rejects.toThrow('Connection timeout');
    });

    it('should throw error when updateTask fails due to Supabase error', async () => {
      const supabaseError = new Error('Update failed');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(supabaseError));

      await expect(updateTask('task-1', { title: 'Updated' })).rejects.toThrow('Update failed');
    });

    it('should throw error when deleteTask fails due to network failure', async () => {
      const networkError = new Error('Network unavailable');
      const { supabase } = await import('../../src/services/supabase');
      (supabase.from as vi.Mock).mockReturnValueOnce(createMockWithError(networkError));

      await expect(deleteTask('task-1')).rejects.toThrow('Network unavailable');
    });
  });
});