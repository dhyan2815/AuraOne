// Verify the behavior and configuration presets of the primary aiService module under testing environments.

import { describe, it, expect, vi } from 'vitest';

// Stub environment dependencies (API URLs, keys, notes, tasks, events, and validation schemas) before loading services.
vi.mock('../../src/config/api', () => ({
  getAIConfig: () => ({
    gemini: {
      enabled: true,
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.0-flash',
      apiKey: 'test-key',
    },
    openRouter: {
      enabled: true,
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openrouter/free',
      apiKey: 'test-key',
    },
  }),
}));

vi.mock('../../src/utils/aiCommandSchema', () => ({
  validateAICommand: vi.fn().mockReturnValue({
    action: 'chat',
    type: 'general',
    data: { message: 'Test response' },
  }),
  createRepairPrompt: vi.fn(),
  type: {},
}));

vi.mock('../../src/hooks/useNotes', () => ({
  createNote: vi.fn().mockResolvedValue({}),
  deleteNote: vi.fn().mockResolvedValue({}),
  updateNote: vi.fn().mockResolvedValue({}),
  getNotes: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../src/hooks/useTasks', () => ({
  createTask: vi.fn().mockResolvedValue({}),
  deleteTask: vi.fn().mockResolvedValue({}),
  updateTask: vi.fn().mockResolvedValue({}),
  getTasks: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../src/hooks/useEvents', () => ({
  createEvent: vi.fn().mockResolvedValue({}),
  deleteEvent: vi.fn().mockResolvedValue({}),
  getEvents: vi.fn().mockResolvedValue([]),
}));

describe('aiService', () => {
  it('should export processAIRequest function', async () => {
    // Dynamic import to ensure mocks are applied
    const { processAIRequest } = await import('../../src/services/aiService');
    expect(typeof processAIRequest).toBe('function');
  });

  it('should export configuration objects', async () => {
    const { AI_CONFIG, SERVICE_CONFIG } = await import('../../src/services/aiService');

    expect(AI_CONFIG).toBeDefined();
    expect(AI_CONFIG.gemini).toBeDefined();
    expect(AI_CONFIG.openRouter).toBeDefined();

    expect(SERVICE_CONFIG).toBeDefined();
    expect(SERVICE_CONFIG.MAX_RETRIES).toBe(3);
    expect(SERVICE_CONFIG.TIMEOUT_MS).toBe(15000);
  });

  it('should have correct service configuration defaults', async () => {
    const { SERVICE_CONFIG } = await import('../../src/services/aiService');

    expect(SERVICE_CONFIG.BACKOFF_MS).toBe(2000);
  });
});