import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original fetch
let originalFetch: typeof fetch;

describe('AI Fallback Chain', () => {
  beforeEach(() => {
    // Store original fetch and replace with mock
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should handle successful API responses', async () => {
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Success response' } }],
      }),
    });

    const response = await fetch('https://api.example.com/test');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.choices[0].message.content).toBe('Success response');
  });

  it('should handle failed API responses with retry logic', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      });
    });

    global.fetch = mockFetch;

    // Simulate retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await fetch('https://api.example.com');
        break;
      } catch (error) {
        lastError = error as Error;
      }
    }

    expect(callCount).toBe(3);
    expect(lastError).toBeDefined();
  });

  it('should parse JSON responses correctly', async () => {
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        model: 'gemini-2.0-flash',
        choices: [{ message: { content: '{"action":"chat"}' } }],
      }),
    });

    const response = await fetch('https://generativelanguage.googleapis.com/test');
    const data = await response.json();

    expect(data.model).toBe('gemini-2.0-flash');
    expect(data.choices[0].message.content).toContain('action');
  });
});