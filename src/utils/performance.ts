// Performance monitor utility — Tracks operation latency and failure rates for API requests and system events.

// Shape of performance metrics tracked for operation execution.
interface PerformanceMetric {
  id: string; // Unique metric execution identifier.
  operation: string; // Name of the tracked process or service call.
  startTime: number; // Start timestamp in milliseconds.
  endTime?: number; // Completion timestamp.
  duration?: number; // Total duration in milliseconds.
  status: 'pending' | 'success' | 'error'; // Current state of the operation.
  error?: string; // Captured error message if status is 'error'.
}

// Manage telemetry collection, latency tracking, and duration averages.
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []; // In-memory metrics storage array.

  // Initiate an operation record and return its unique identifier.
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

  // Record operation completion stats and compute elapsed duration.
  end(id: string, status: 'success' | 'error', error?: string): void {
    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.status = status;
      metric.error = error;
    }
  }

  // Retrieve the complete telemetry history log.
  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  // Calculate the mean execution duration for a specific operation name.
  getAverageDuration(operation: string): number {
    const relevant = this.metrics.filter(m => m.operation === operation && m.duration);
    if (relevant.length === 0) return 0;
    const total = relevant.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / relevant.length;
  }
}

// Export singleton instance of the monitor for global application use.
export const perfMonitor = new PerformanceMonitor();
