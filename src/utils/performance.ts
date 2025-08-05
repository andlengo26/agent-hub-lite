/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  memoryUsage?: number;
  fps?: number;
  loadTime: number;
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        renderTime,
        totalTime: now - mountTime.current
      });
    }

    return () => {
      if (renderCount.current === 1) {
        const totalTime = Date.now() - mountTime.current;
        console.log(`[Performance] ${componentName} unmounted after ${totalTime}ms`);
      }
    };
  });

  return {
    renderCount: renderCount.current,
    renderTime: Date.now() - lastRenderTime.current,
    totalTime: Date.now() - mountTime.current
  };
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (!('memory' in performance)) {
      return;
    }

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      if (memory) {
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// FPS monitoring
export function useFPSMonitor() {
  const [fps, setFps] = useState<number>(60);
  const lastTime = useRef<number>(performance.now());
  const frames = useRef<number>(0);

  useEffect(() => {
    let animationId: number;

    const updateFPS = (currentTime: number) => {
      frames.current++;
      
      if (currentTime - lastTime.current >= 1000) {
        setFps(Math.round((frames.current * 1000) / (currentTime - lastTime.current)));
        frames.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return fps;
}

// Debounced value hook for performance
export function useDebounced<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottled<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Performance profiler component
export const PerformanceProfiler: React.FC<{
  children: React.ReactNode;
  name: string;
  onRender?: (metrics: PerformanceMetrics) => void;
}> = ({ children, name, onRender }) => {
  const startTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - startTime.current;
    
    const metrics: PerformanceMetrics = {
      renderTime,
      componentMounts: renderCount.current,
      loadTime: renderTime
    };

    onRender?.(metrics);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Profiler] ${name}:`, metrics);
    }
  });

  return React.createElement(React.Fragment, null, children);
};

// Performance optimization utilities
export const PerformanceUtils = {
  // Measure function execution time
  measureFunction: function<T extends (...args: any[]) => any>(fn: T, name: string): T {
    return ((...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name} took ${end - start}ms`);
      }
      
      return result;
    }) as T;
  },

  // Detect slow renders
  detectSlowRenders: (threshold: number = 16) => {
    if (process.env.NODE_ENV === 'development') {
      let lastFrameTime = performance.now();
      
      const checkFrameTime = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        
        if (frameTime > threshold) {
          console.warn(`[Performance] Slow render detected: ${frameTime}ms (threshold: ${threshold}ms)`);
        }
        
        lastFrameTime = currentTime;
        requestAnimationFrame(checkFrameTime);
      };
      
      requestAnimationFrame(checkFrameTime);
    }
  },

  // Memory leak detector
  detectMemoryLeaks: () => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const initialMemory = (performance as any).memory.usedJSHeapSize;
      
      return () => {
        const currentMemory = (performance as any).memory.usedJSHeapSize;
        const difference = currentMemory - initialMemory;
        
        if (difference > 10 * 1048576) { // 10MB threshold
          console.warn(`[Performance] Potential memory leak detected: ${Math.round(difference / 1048576)}MB increase`);
        }
      };
    }
    
    return () => {};
  }
};