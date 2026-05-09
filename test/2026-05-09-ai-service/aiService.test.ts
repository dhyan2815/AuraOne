import { beforeEach, describe, expect, it, vi } from 'vitest';

const createTaskMock = vi.fn();
const deleteTaskMock = vi.fn();
const updateTaskMock = vi.fn();
const getTasksMock = vi.fn();

const createNoteMock = vi.fn();
const deleteNoteMock = vi.fn();
const updateNoteMock = vi.fn();
const getNotesMock = vi.fn();

const createEventMock = vi.fn();
const deleteEventMock = vi.fn();
const getEventsMock = vi.fn();

vi.mock('../src/config/api', () => ({
  getAIConfig: () => ({
    gemini: {
      enabled: true,
      apiKey: 'gemini-key',
      apiUrl: 'https://gemini.test',
      model: 'gemini-test',
    },
    qwen: {
      enabled: true,
      endpoint: 'https://qwen.test',
      model: 'qwen-test',
    },
    openRouter: {
      enabled: true,
      apiKey: 'openrouter-key',
      apiUrl: 'https://openrouter.test',
      model: 'openrouter/free',
    },
    environment: 'test',
    validation: {
      valid: true,
      missing: [],
      warnings: [],
      environment: 'test',
    },
  }),
}));

vi.mock('../src/hooks/useTasks', () => ({
  createTask: createTaskMock,
  deleteTask: deleteTaskMock,
  updateTask: updateTaskMock,
  getTasks: getTasksMock,
}));

vi.mock('../src/hooks/useNotes', () => ({
  createNote: createNoteMock,
  deleteNote: deleteNoteMock,
  updateNote: updateNoteMock,
  getNotes: getNotesMock,
}));

vi.mock('../src/hooks/useEvents', () => ({
  createEvent: createEventMock,
  deleteEvent: deleteEventMock,
  getEvents: getEventsMock,
}));

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as Response;

const geminiCommandResponse = (text: string) =>
  jsonResponse({
    candidates: [
      {
        content: {
          parts: [{ text }],
        },
      },
    ],
  });

const qwenCommandResponse = (text: string) =>
  jsonResponse({
    response: text,
  });

const openRouterResponse = (text: string) =>
  jsonResponse({
    choices: [
      {
        message: {
          content: text,
        },
      },
    ],
  });

describe('AI service behavior', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Scenario 2: successful CRUD routing through processAIRequest', () => {
    it('routes valid create, read, update, delete, and chat commands to the correct handlers', async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'create',
              type: 'task',
              data: {
                task: {
                  title: 'Plan sprint',
                  description: 'Outline milestones',
                  dueDate: 'tomorrow 9am',
                  priority: 'high',
                },
              },
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'read',
              type: 'note',
              data: {},
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'update',
              type: 'task',
              data: {
                id: 'task-55',
                task: {
                  title: 'Renamed task',
                  priority: 'low',
                },
              },
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'delete',
              type: 'event',
              data: {
                id: 'event-22',
              },
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'chat',
              type: 'general',
              data: {
                message: 'Hello! How can I help you today?',
              },
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'create',
              type: 'event',
              data: {
                event: {
                  title: 'Doctor appointment',
                  date: 'next monday 2pm',
                  time: '14:00',
                  description: 'Annual checkup',
                },
              },
            })
          )
        );

      getNotesMock.mockResolvedValueOnce([
        { id: 'n1', title: 'Roadmap', content: null, tags: null, created_at: '', is_archived: false, user_id: 'user-1' },
      ]);

      const { processAIRequest } = await import('../src/services/aiService');

      const createTaskResult = await processAIRequest('Create a high priority task', 'user-1');
      const readNotesResult = await processAIRequest('Show my notes', 'user-1');
      const updateTaskResult = await processAIRequest('Update task 55', 'user-1');
      const deleteEventResult = await processAIRequest('Delete event 22', 'user-1');
      const chatResult = await processAIRequest('Hello', 'user-1');
      const createEventResult = await processAIRequest('Schedule my appointment', 'user-1');

      expect(createTaskResult).toBe('Task "Plan sprint" created successfully ✅');
      expect(createTaskMock).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          title: 'Plan sprint',
          description: 'Outline milestones',
          completed: false,
          priority: 'high',
          due_date: expect.stringMatching(/T/),
        })
      );

      expect(readNotesResult).toBe('Your Notes:\n- Roadmap');
      expect(updateTaskResult).toBe('Task updated successfully ✅');
      expect(updateTaskMock).toHaveBeenCalledWith(
        'task-55',
        expect.objectContaining({
          title: 'Renamed task',
          priority: 'low',
        })
      );

      expect(deleteEventResult).toBe('Event deleted successfully 🗑️');
      expect(deleteEventMock).toHaveBeenCalledWith('event-22');
      expect(chatResult).toBe('Hello! How can I help you today?');

      expect(createEventResult).toBe('Event "Doctor appointment" created successfully ✅');
      expect(createEventMock).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          title: 'Doctor appointment',
          description: null,
          end_time: null,
          start_time: expect.stringMatching(/T/),
        })
      );
    });
  });

  describe('Scenario 3: read-state edge cases and formatting', () => {
    it('returns empty-state and populated-state messages for task, note, and event reads', async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock
        .mockResolvedValueOnce(geminiCommandResponse(JSON.stringify({ action: 'read', type: 'task', data: {} })))
        .mockResolvedValueOnce(geminiCommandResponse(JSON.stringify({ action: 'read', type: 'task', data: {} })))
        .mockResolvedValueOnce(geminiCommandResponse(JSON.stringify({ action: 'read', type: 'note', data: {} })))
        .mockResolvedValueOnce(geminiCommandResponse(JSON.stringify({ action: 'read', type: 'note', data: {} })))
        .mockResolvedValueOnce(geminiCommandResponse(JSON.stringify({ action: 'read', type: 'event', data: {} })))
        .mockResolvedValueOnce(geminiCommandResponse(JSON.stringify({ action: 'read', type: 'event', data: {} })));

      getTasksMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 't1', title: 'File taxes', user_id: 'user-1', due_date: '2026-05-15T08:00:00.000Z' }]);
      getNotesMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 'n1', title: 'Ideas', content: null, tags: null, created_at: '', is_archived: false, user_id: 'user-1' }]);
      getEventsMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 'e1', title: 'Standup', start_time: '2026-05-15T09:30:00.000Z', end_time: null, description: null, created_at: '', user_id: 'user-1' }]);

      const { processAIRequest } = await import('../src/services/aiService');

      expect(await processAIRequest('Show tasks', 'user-1')).toBe('No tasks found 📭');
      expect(await processAIRequest('Show tasks again', 'user-1')).toBe('Your Tasks:\n- File taxes (May 15)');
      expect(await processAIRequest('Show notes', 'user-1')).toBe('No notes found 📝');
      expect(await processAIRequest('Show notes again', 'user-1')).toBe('Your Notes:\n- Ideas');
      expect(await processAIRequest('Show events', 'user-1')).toBe('No events found 🗓️');
      expect(await processAIRequest('Show events again', 'user-1')).toBe('Your Events:\n- Standup (May 15 15:00)');
    });
  });

  describe('Scenario 4: fallback and repair logic', () => {
    it('falls back to OpenRouter commands or chat and uses repair prompts when retries remain', async () => {
      const fetchMock = vi.mocked(global.fetch);

      fetchMock
        .mockResolvedValueOnce(geminiCommandResponse('not json'))
        .mockResolvedValueOnce(
          openRouterResponse(
            JSON.stringify({
              action: 'delete',
              type: 'note',
              data: {
                id: 'note-11',
              },
            })
          )
        )
        .mockResolvedValueOnce(geminiCommandResponse('not json again'))
        .mockResolvedValueOnce(openRouterResponse('Plain assistant reply from fallback'))
        .mockResolvedValueOnce(geminiCommandResponse('still not json'))
        .mockResolvedValueOnce(jsonResponse({ response: 'still broken too' }))
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'create',
              type: 'note',
              data: {
                note: {
                  title: 'Recovered note',
                  content: 'Fixed after repair',
                },
              },
            })
          )
        );

      const { processAIRequest } = await import('../src/services/aiService');

      const fallbackCrudResult = await processAIRequest('Delete my broken note', 'user-1');
      const fallbackChatResult = await processAIRequest('Talk normally', 'user-1');
      const repairedResult = await processAIRequest('Create a note after repair', 'user-1', { maxRetries: 2 });

      expect(fallbackCrudResult).toBe('Note deleted successfully 🗑️');
      expect(deleteNoteMock).toHaveBeenCalledWith('note-11');

      expect(fallbackChatResult).toBe('Plain assistant reply from fallback');

      expect(repairedResult).toBe('Note "Recovered note" created successfully ✅');
      expect(createNoteMock).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          title: 'Recovered note',
          content: 'Fixed after repair',
          tags: [],
          is_archived: false,
        })
      );

      expect(fetchMock).toHaveBeenNthCalledWith(
        7,
        expect.stringContaining('https://gemini.test/models/'),
        expect.objectContaining({
          body: expect.stringContaining('Your previous response was invalid.'),
        })
      );
    });
  });

  describe('Scenario 5: failure paths and unsupported operations', () => {
    it('covers brain mode, gemini fallback on HTTP errors, unsupported updates, missing ids, and final exhaustion', async () => {
      const fetchMock = vi.mocked(global.fetch);

      fetchMock
        .mockResolvedValueOnce(openRouterResponse('Brain mode answer'))
        .mockResolvedValueOnce(jsonResponse({}, false, 429))
        .mockResolvedValueOnce(
          openRouterResponse(
            JSON.stringify({
              action: 'chat',
              type: 'general',
              data: {
                message: 'Fallback after gemini rate limit',
              },
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'update',
              type: 'event',
              data: {
                id: 'event-44',
                event: {
                  title: 'Shift event',
                },
              },
            })
          )
        )
        .mockResolvedValueOnce(
          qwenCommandResponse(
            JSON.stringify({
              action: 'update',
              type: 'event',
              data: {
                id: 'event-44',
                event: {
                  title: 'Shift event',
                },
              },
            })
          )
        )
        .mockResolvedValueOnce(
          geminiCommandResponse(
            JSON.stringify({
              action: 'update',
              type: 'task',
              data: {
                task: {
                  title: 'No id task',
                },
              },
            })
          )
        )
        .mockResolvedValueOnce(jsonResponse({}, true, 200))
        .mockResolvedValueOnce(
          qwenCommandResponse(
            JSON.stringify({
              action: 'update',
              type: 'task',
              data: {
                task: {
                  title: 'No id task',
                },
              },
            })
          )
        )
        .mockResolvedValueOnce(jsonResponse({}, true, 200))
        .mockResolvedValueOnce(jsonResponse({}, false, 500))
        .mockResolvedValueOnce(jsonResponse({}, false, 500));

      const { processAIRequest } = await import('../src/services/aiService');

      await expect(processAIRequest('Think deeper', 'user-1', { mode: 'brain' })).resolves.toBe('Brain mode answer');
      await expect(processAIRequest('Handle gemini rate limit', 'user-1')).resolves.toBe('Fallback after gemini rate limit');
      await expect(processAIRequest('Update this event', 'user-1', { maxRetries: 1 })).rejects.toThrow(
        'Critical Intelligence Failure: CRUD operation failed: Event updates not yet implemented'
      );
      await expect(processAIRequest('Update this task without an id', 'user-1', { maxRetries: 1 })).rejects.toThrow(
        'Critical Intelligence Failure: Failed to parse AI response: Invalid AI command structure: data.id: Invalid input: expected string, received undefined'
      );
      await expect(processAIRequest('Make everything fail', 'user-1', { maxRetries: 1 })).rejects.toThrow(
        'Critical Intelligence Failure: [src/services/aiService.ts:callQwenAPI] Qwen API error: 500'
      );
    });
  });
});
