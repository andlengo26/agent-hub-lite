/**
 * Performance Monitoring System
 * Real-time performance tracking and optimization
 */

import { logger } from './logger';

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ComponentMetrics {
  renderTime: number;
  rerenderCount: number;
  memoryCells: number;
  lastRender: number;
}

interface BundleMetrics {
  chunkSizes: Record<string, number>;
  loadTimes: Record<string, number>;
  cacheHitRate: number;
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  
  // Core monitoring methods
  start() {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.setupObservers();
    this.monitorBundlePerformance();
    this.monitorMemoryUsage();
    
    logger.debug('Performance monitoring started');
  }

  stop() {
    if (!this.isMonitoring) return;
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
    
    logger.debug('Performance monitoring stopped');
  }

  // Component performance tracking
  trackComponent(name: string, renderTime: number) {
    const existing = this.componentMetrics.get(name) || {
      renderTime: 0,
      rerenderCount: 0,
      memoryCells: 0,
      lastRender: 0
    };

    this.componentMetrics.set(name, {
      ...existing,
      renderTime: (existing.renderTime + renderTime) / 2, // Moving average
      rerenderCount: existing.rerenderCount + 1,
      lastRender: Date.now()
    });

    this.recordMetric('component.render', renderTime, { componentName: name });
  }

  // Bundle performance monitoring
  private monitorBundlePerformance() {
    if (!window.performance) return;

    // Monitor navigation timing
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      this.recordMetric('bundle.loadTime', navigationTiming.loadEventEnd - navigationTiming.fetchStart);
      this.recordMetric('bundle.domContentLoaded', navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart);
    }

    // Monitor resource timing
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    resourceEntries.forEach(entry => {
      if (entry.name.includes('.js') || entry.name.includes('.css')) {
        this.recordMetric('bundle.resourceLoad', entry.responseEnd - entry.fetchStart, {
          resource: entry.name,
          size: entry.transferSize
        });
      }
    });
  }

  // Memory usage monitoring
  private monitorMemoryUsage() {
    if (!(performance as any).memory) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      this.recordMetric('memory.used', memory.usedJSHeapSize);
      this.recordMetric('memory.total', memory.totalJSHeapSize);
      this.recordMetric('memory.limit', memory.jsHeapSizeLimit);
    };

    checkMemory();
    setInterval(checkMemory, 30000); // Check every 30 seconds
  }

  // Setup performance observers
  private setupObservers() {
    if (!window.PerformanceObserver) return;

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('web-vitals.lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      logger.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any; // Cast to access FID-specific properties
          this.recordMetric('web-vitals.fid', fidEntry.processingStart - fidEntry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      logger.warn('FID observer not supported');
    }

    // Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            this.recordMetric('web-vitals.cls', (entry as any).value);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      logger.warn('CLS observer not supported');
    }
  }

  // Record a performance metric
  private recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log performance issues
    this.checkPerformanceThresholds(metric);
  }

  // Check for performance issues
  private checkPerformanceThresholds(metric: PerformanceMetric) {
    const thresholds = {
      'component.render': 16, // 60fps threshold
      'bundle.loadTime': 3000, // 3 seconds
      'web-vitals.lcp': 2500, // Good LCP
      'web-vitals.fid': 100, // Good FID
      'web-vitals.cls': 0.1, // Good CLS
      'memory.used': 100 * 1024 * 1024 // 100MB
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      logger.warn(`Performance threshold exceeded for ${metric.name}: ${metric.value} > ${threshold}`, {
        metric,
        threshold
      });
    }
  }

  // Get performance report
  getPerformanceReport(): {
    components: Record<string, ComponentMetrics>;
    metrics: PerformanceMetric[];
    summary: Record<string, any>;
  } {
    const components = Object.fromEntries(this.componentMetrics);
    
    // Calculate summary statistics
    const summary = this.calculateSummary();

    return {
      components,
      metrics: this.metrics.slice(-100), // Last 100 metrics
      summary
    };
  }

  // Calculate performance summary
  private calculateSummary() {
    const summary: Record<string, any> = {};

    // Group metrics by category
    const metricsByCategory = this.metrics.reduce((acc, metric) => {
      const category = metric.name.split('.')[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // Calculate averages and totals for each category
    Object.entries(metricsByCategory).forEach(([category, metrics]) => {
      const values = metrics.map(m => m.value);
      summary[category] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        recent: values.slice(-10) // Last 10 values
      };
    });

    return summary;
  }

  // Get slow components
  getSlowComponents(threshold = 16): Array<{ name: string; metrics: ComponentMetrics }> {
    return Array.from(this.componentMetrics.entries())
      .filter(([_, metrics]) => metrics.renderTime > threshold)
      .map(([name, metrics]) => ({ name, metrics }))
      .sort((a, b) => b.metrics.renderTime - a.metrics.renderTime);
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
    this.componentMetrics.clear();
    logger.debug('Performance metrics cleared');
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      performanceMonitor.trackComponent(componentName, endTime - startTime);
    };
  });
}

// Performance measurement utilities
export const PerformanceUtils = {
  // Measure function execution time
  measure: async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    performanceMonitor.trackComponent(name, endTime - startTime);
    return result;
  },

  // Measure component render time
  measureRender: (name: string, renderFn: () => void) => {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    performanceMonitor.trackComponent(name, endTime - startTime);
  },

  // Check if performance monitoring is available
  isSupported: () => {
    return typeof window !== 'undefined' && 
           'performance' in window && 
           'now' in window.performance;
  },

  // Get performance marks
  getMarks: (name?: string) => {
    if (!PerformanceUtils.isSupported()) return [];
    
    return performance.getEntriesByType('mark')
      .filter(entry => !name || entry.name.includes(name));
  },

  // Create performance mark
  mark: (name: string) => {
    if (PerformanceUtils.isSupported()) {
      performance.mark(name);
    }
  },

  // Measure between marks
  measureBetween: (startMark: string, endMark: string, name?: string) => {
    if (!PerformanceUtils.isSupported()) return;
    
    const measureName = name || `${startMark}-to-${endMark}`;
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    if (measure) {
      performanceMonitor.trackComponent(measureName, measure.duration);
    }
  }
};

// Auto-start performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.start();
}

import React from 'react';
