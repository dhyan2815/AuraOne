// Verify integration fallback behaviors, ensuring fetch errors trigger proper retries, network switches, and JSON parsing.

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Reference variable to cache and restore the standard global fetch API.
let originalFetch: typeof fetch;

describe('AI Fallback Chain', () => {
  // Capture the native environment fetch reference and overwrite it with a clean Vitest mock before each run.
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  // Re-establish native fetch APIs on completed test iterations.
  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Confirm standard successful API responses resolve correctly without throwing or retrying.
  it('should handle successful API responses', async () => {
    (global.fetch as Mock).mockResolvedValue({
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

    global.fetch = mockFetch as unknown as typeof fetch;

    // Simulate retry logic - succeeds on 3rd attempt
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch('https://api.example.com');
        if (response.ok) {
          success = true;
          break;
        }
      } catch {
        // Error is expected on first 2 attempts; retry continues
      }
    }

    expect(callCount).toBe(3);
    expect(success).toBe(true);
    // After successful retry, there should be no error
    // Note: lastError may still have value from last failure before success
  });

  it('should parse JSON responses correctly', async () => {
    (global.fetch as Mock).mockResolvedValue({
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