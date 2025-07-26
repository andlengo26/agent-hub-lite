/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
  chatLoadTime: number;
  filterTime: number;
  renderTime: number;
  memoryUsage: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    chatLoadTime: 0,
    filterTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  };

  private startTimes: Map<string, number> = new Map();

  startTiming(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  endTiming(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.startTimes.delete(operation);
    
    // Store in metrics
    if (operation in this.metrics) {
      (this.metrics as any)[operation] = duration;
    }
    
    return duration;
  }

  measureMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      return this.metrics.memoryUsage;
    }
    return 0;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  logMetrics(): void {
    console.group('🔍 Performance Metrics');
    console.log('Chat Load Time:', `${this.metrics.chatLoadTime.toFixed(2)}ms`);
    console.log('Filter Time:', `${this.metrics.filterTime.toFixed(2)}ms`);
    console.log('Render Time:', `${this.metrics.renderTime.toFixed(2)}ms`);
    console.log('Memory Usage:', `${this.metrics.memoryUsage.toFixed(2)}MB`);
    console.groupEnd();
  }

  // Performance thresholds
  checkPerformance(): boolean {
    const warnings = [];
    
    if (this.metrics.chatLoadTime > 1000) {
      warnings.push('Chat load time exceeds 1s');
    }
    
    if (this.metrics.filterTime > 100) {
      warnings.push('Filter operation exceeds 100ms');
    }
    
    if (this.metrics.memoryUsage > 50) {
      warnings.push('Memory usage exceeds 50MB');
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Performance warnings:', warnings);
      return false;
    }
    
    return true;
  }
}

export const performanceMonitor = new PerformanceMonitor();