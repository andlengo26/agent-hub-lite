/**
 * Bundle Optimization Utilities
 * Code splitting and lazy loading configuration
 */

import { lazy, ComponentType } from 'react';
import React from 'react';

// Simple lazy loading utility that doesn't require complex default export handling
export const createSimpleLazyComponent = (importPath: string) => {
  return lazy(() => 
    // Use dynamic import with a fallback component
    import(/* @vite-ignore */ importPath).then(module => ({
      default: module.default || module[Object.keys(module)[0]] || (() => React.createElement('div', null, 'Loading...'))
    })).catch(() => ({
      default: () => React.createElement('div', null, 'Failed to load component')
    }))
  );
};

// Preloading strategies for different user interactions
export const PreloadStrategies = {
  // Preload on hover for quick access
  onHover: (importPath: string) => {
    return () => {
      // Pre-import the component module for faster loading
      import(/* @vite-ignore */ importPath).catch(() => {
        // Silently fail preloading
      });
    };
  },

  // Preload critical components after initial page load
  critical: () => {
    setTimeout(() => {
      Promise.all([
        import('@/components/admin/ChatPanel').catch(() => {}),
        import('@/components/admin/OptimizedChatList').catch(() => {}),
      ]);
    }, 2000);
  },

  // Preload route-specific components
  route: (route: string) => {
    switch (route) {
      case '/settings':
        import('@/pages/admin/settings/WidgetManagement').catch(() => {});
        break;
      case '/agent':
        import('@/components/admin/agent-console/AgentConsoleLayout').catch(() => {});
        break;
      default:
        break;
    }
  }
};

// Bundle analysis configuration
export const BundleConfig = {
  // Routes that should be code-split
  splitRoutes: [
    '/settings/moodle',
    '/agent/console',
    '/content/upload',
    '/analytics/detailed'
  ],

  // Components that should always be lazy-loaded
  heavyComponents: [
    'ChartComponents',
    'MoodleConfiguration', 
    'AgentConsoleMainView'
  ],

  // Critical components that should be preloaded
  criticalComponents: [
    'ChatPanel',
    'OptimizedChatList',
    'NotificationCenter'
  ]
};

// Performance monitoring for lazy loading
export const LazyLoadingMetrics = {
  trackComponentLoad: (componentName: string, loadTime: number) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`lazy-${componentName}-loaded`);
      console.debug(`Lazy component ${componentName} loaded in ${loadTime}ms`);
    }
  },

  trackBundleSize: (bundleName: string, size: number) => {
    if (typeof window !== 'undefined') {
      console.debug(`Bundle ${bundleName} size: ${(size / 1024).toFixed(2)}KB`);
    }
  }
};

// Bundle splitting utilities
export const BundleSplitter = {
  // Split by route
  splitByRoute: (routes: string[]) => {
    return routes.reduce((acc, route) => {
      const componentName = route.split('/').pop() || 'Unknown';
      acc[componentName] = createSimpleLazyComponent(`@/pages${route}`);
      return acc;
    }, {} as Record<string, ReturnType<typeof createSimpleLazyComponent>>);
  },

  // Split by feature
  splitByFeature: (features: Record<string, string>) => {
    return Object.entries(features).reduce((acc, [name, path]) => {
      acc[name] = createSimpleLazyComponent(path);
      return acc;
    }, {} as Record<string, ReturnType<typeof createSimpleLazyComponent>>);
  }
};

// Chunk optimization utilities
export const ChunkOptimizer = {
  // Calculate optimal chunk size
  calculateOptimalChunkSize: (totalSize: number, targetChunks: number = 5) => {
    return Math.ceil(totalSize / targetChunks);
  },

  // Analyze bundle composition
  analyzeBundleComposition: () => {
    if (typeof window === 'undefined') return {};

    // Simple bundle analysis using performance entries
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources
      .filter(entry => entry.name.includes('.js'))
      .reduce((acc, entry) => {
        const name = entry.name.split('/').pop() || 'unknown';
        acc[name] = {
          size: entry.transferSize || 0,
          loadTime: entry.responseEnd - entry.fetchStart,
          cached: entry.transferSize === 0
        };
        return acc;
      }, {} as Record<string, any>);
  }
};

// Resource optimization
export const ResourceOptimizer = {
  // Preload critical resources
  preloadCriticalResources: (resources: string[]) => {
    if (typeof document === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.js') ? 'script' : 'style';
      document.head.appendChild(link);
    });
  },

  // Prefetch non-critical resources
  prefetchResources: (resources: string[]) => {
    if (typeof document === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }
};