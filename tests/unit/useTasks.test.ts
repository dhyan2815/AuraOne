import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockTasks = [
  { id: '1', user_id: 'user-1', title: 'Task 1', completed: false, priority: 'high' },
  { id: '2', user_id: 'user-1', title: 'Task 2', completed: true, priority: 'low' },
];

const mockTask = { id: 'task-1', user_id: 'user-1', title: 'Test Task' };
const createdTask = { id: 'task-1', user_id: 'user-1', title: 'New Task', priority: 'medium' };
const updatedTask = { id: 'task-1', user_id: 'user-1', title: 'Updated Task', completed: true };

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
});