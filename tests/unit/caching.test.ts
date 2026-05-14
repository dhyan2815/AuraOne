import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple in-memory cache implementation for testing
class SimpleCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

describe('Caching Behavior', () => {
  let cache: SimpleCache<string>;

  beforeEach(() => {
    cache = new SimpleCache<string>();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve cached data', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete cached data', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
    });

    it('should clear all cached data', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('Cache Expiration', () => {
    it('should expire cached data after TTL', async () => {
      vi.useFakeTimers();
      // Use very short TTL for testing (100ms)
      cache.set('key1', 'value1', 100);

      // Should be available immediately
      expect(cache.get('key1')).toBe('value1');

      // Advance time past expiry
      vi.advanceTimersByTime(150);

      // Should be expired
      expect(cache.get('key1')).toBeNull();
      vi.useRealTimers();
    });

    it('should not return expired data even if key still exists in map', () => {
      vi.useFakeTimers();
      cache.set('key1', 'value1', 50);

      // Should work before expiry
      expect(cache.get('key1')).toBe('value1');

      // Advance time past expiry
      vi.advanceTimersByTime(100);

      // Should be expired
      const item = cache.get('key1');
      expect(item).toBeNull();
      vi.useRealTimers();
    });
  });

  describe('Cache for API Responses', () => {
    it('should cache API responses', () => {
      const apiResponse = JSON.stringify({ data: 'test', status: 200 });
      cache.set('api:/tasks', apiResponse);

      const cached = cache.get('api:/tasks');
      expect(cached).toBe(apiResponse);
    });

    it('should invalidate specific cache entries', () => {
      cache.set('api:/tasks', 'tasks-data');
      cache.set('api:/notes', 'notes-data');

      // Invalidate only tasks
      cache.delete('api:/tasks');

      expect(cache.get('api:/tasks')).toBeNull();
      expect(cache.get('api:/notes')).toBe('notes-data');
    });

    it('should handle cache misses gracefully', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      const generateKey = (resource: string, id: string) => `${resource}:${id}`;

      const key1 = generateKey('tasks', '123');
      const key2 = generateKey('tasks', '123');
      const key3 = generateKey('tasks', '456');

      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
    });

    it('should use cache key for different resources', () => {
      cache.set('tasks:user-1', 'user-1-tasks');
      cache.set('notes:user-1', 'user-1-notes');

      expect(cache.get('tasks:user-1')).toBe('user-1-tasks');
      expect(cache.get('notes:user-1')).toBe('user-1-notes');
    });
  });
});