import { describe, it, expect } from 'vitest';
import { perfMonitor } from '../../src/utils/performance';

describe('performance monitor', () => {
  it('records and completes a metric by id', async () => {
    const id = perfMonitor.start('ai-service.processAIRequest');
    await new Promise(resolve => setTimeout(resolve, 5));
    perfMonitor.end(id, 'success');

    const metric = perfMonitor.getMetrics().find(m => m.id === id);
    expect(metric).toBeDefined();
    expect(metric?.operation).toBe('ai-service.processAIRequest');
    expect(metric?.status).toBe('success');
    expect(metric?.duration).toBeGreaterThanOrEqual(0);
  });

  it('calculates average duration by operation', async () => {
    const id1 = perfMonitor.start('cache.lookup');
    await new Promise(resolve => setTimeout(resolve, 3));
    perfMonitor.end(id1, 'success');

    const id2 = perfMonitor.start('cache.lookup');
    await new Promise(resolve => setTimeout(resolve, 3));
    perfMonitor.end(id2, 'success');

    const avg = perfMonitor.getAverageDuration('cache.lookup');
    expect(avg).toBeGreaterThan(0);
  });

  it('captures error status and error message', () => {
    const id = perfMonitor.start('openrouter.fallback');
    perfMonitor.end(id, 'error', 'timeout');

    const metric = perfMonitor.getMetrics().find(m => m.id === id);
    expect(metric?.status).toBe('error');
    expect(metric?.error).toBe('timeout');
  });
});
