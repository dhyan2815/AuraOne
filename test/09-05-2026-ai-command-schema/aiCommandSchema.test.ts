import { describe, expect, it } from 'vitest';
import { createRepairPrompt, validateAICommand } from '../src/utils/aiCommandSchema';

describe('Scenario 1: AI command schema validation and repair prompt', () => {
  it('accepts valid commands across all supported action families', () => {
    const commands = [
      {
        action: 'create',
        type: 'task',
        data: {
          task: {
            title: 'Buy milk',
          },
        },
      },
      {
        action: 'read',
        type: 'note',
        data: {
          filter: {
            pinned: true,
          },
        },
      },
      {
        action: 'update',
        type: 'event',
        data: {
          id: 'event-1',
          event: {
            title: 'Moved meeting',
          },
        },
      },
      {
        action: 'delete',
        type: 'task',
        data: {
          id: 'task-1',
        },
      },
      {
        action: 'chat',
        type: 'general',
        data: {
          message: 'Hello there',
        },
      },
    ] as const;

    const [createCommand, readCommand, updateCommand, deleteCommand, chatCommand] = commands.map(validateAICommand);

    expect(createCommand.data.task?.priority).toBe('medium');
    expect(createCommand.data.task?.completed).toBe('due');
    expect(readCommand).toMatchObject(commands[1]);
    expect(updateCommand).toMatchObject(commands[2]);
    expect(deleteCommand).toMatchObject(commands[3]);
    expect(chatCommand).toMatchObject(commands[4]);
  });

  it('rejects malformed commands with aggregated field errors', () => {
    expect(() =>
      validateAICommand({
        action: 'create',
        type: 'task',
        data: {
          task: {
            title: '',
            priority: 'urgent',
          },
        },
      })
    ).toThrowError(
      'Invalid AI command structure: data.task.title: Task title is required, data.task.priority: Invalid option: expected one of "low"|"medium"|"high"'
    );
  });

  it('requires general chat type and a non-empty chat message', () => {
    expect(() =>
      validateAICommand({
        action: 'chat',
        type: 'task',
        data: {
          message: '',
        },
      })
    ).toThrowError(
      'Invalid AI command structure: type: Invalid input: expected "general", data.message: Chat message is required'
    );
  });

  it('builds a repair prompt with the original request and validation issue details', () => {
    const prompt = createRepairPrompt('make a note for tomorrow', 'data.note.title: Note title is required');

    expect(prompt).toContain('Your previous response was invalid.');
    expect(prompt).toContain('data.note.title: Note title is required');
    expect(prompt).toContain('Original user request: "make a note for tomorrow"');
    expect(prompt).toContain('"action": "create|read|update|delete"');
    expect(prompt).toContain('Do not include any explanations');
  });
});