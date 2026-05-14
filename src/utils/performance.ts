interface PerformanceMetric {
  id: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  start(operation: string): string {
    const id = `${operation}-${Date.now()}`;
    this.metrics.push({
      id,
      operation,
      startTime: Date.now(),
      status: 'pending',
    });
    return id;
  }

  end(id: string, status: 'success' | 'error', error?: string): void {
    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.status = status;
      metric.error = error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  getAverageDuration(operation: string): number {
    const relevant = this.metrics.filter(m => m.operation === operation && m.duration);
    if (relevant.length === 0) return 0;
    const total = relevant.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / relevant.length;
  }
}

export const perfMonitor = new PerformanceMonitor();
