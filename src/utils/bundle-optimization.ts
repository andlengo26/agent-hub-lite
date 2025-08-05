/**
 * Bundle Optimization and Code Splitting Configuration
 * Dynamic imports for performance optimization
 */

import { lazy } from 'react';

// ============= Lazy Loaded Components =============

// Admin Components (Heavy)
export const LazyAllChats = lazy(() => import('@/pages/admin/AllChats'));
export const LazyEngagementHistory = lazy(() => import('@/pages/admin/EngagementHistory'));
export const LazyCustomerEngagementDetail = lazy(() => import('@/pages/admin/CustomerEngagementDetail'));

// Settings Components (Medium)
export const LazyWidgetManagement = lazy(() => import('@/pages/admin/settings/WidgetManagement'));
export const LazyMoodleConfiguration = lazy(() => import('@/pages/admin/settings/MoodleConfiguration'));
export const LazyUsers = lazy(() => import('@/pages/admin/settings/Users'));
export const LazyOrganizations = lazy(() => import('@/pages/admin/settings/Organizations'));

// Content Management (Medium)
export const LazyDocuments = lazy(() => import('@/pages/admin/content/Documents'));
export const LazyFAQs = lazy(() => import('@/pages/admin/content/FAQs'));
export const LazyResources = lazy(() => import('@/pages/admin/content/Resources'));
export const LazyURLScraper = lazy(() => import('@/pages/admin/content/URLScraper'));

// Agent Console (Heavy)
export const LazyAgentConsoleLayout = lazy(() => import('@/components/admin/agent-console/AgentConsoleLayout'));
export const LazyActiveChat = lazy(() => import('@/components/admin/agent-console/ActiveChat'));
export const LazyEmailComposer = lazy(() => import('@/components/admin/agent-console/EmailComposer'));

// Widget Components (Light but frequently used)
export const LazyInteractiveWidget = lazy(() => import('@/components/admin/InteractiveWidget'));
export const LazyWidgetPreview = lazy(() => import('@/components/widget/WidgetPreview'));

// Modal Components (Light)
export const LazyDocumentUploadModal = lazy(() => import('@/components/modals/DocumentUploadModal'));
export const LazyFAQModal = lazy(() => import('@/components/modals/FAQModal'));
export const LazyResourceModal = lazy(() => import('@/components/modals/ResourceModal'));
export const LazyScrapedDataModal = lazy(() => import('@/components/modals/ScrapedDataModal'));

// Chart Components (Heavy dependencies)
export const LazyChartComponents = lazy(() => import('@/components/ui/chart'));

// ============= Preloading Strategies =============

export const preloadStrategies = {
  // Critical components - preload immediately
  critical: [
    () => import('@/components/admin/AdminLayout'),
    () => import('@/components/admin/AdminHeader'),
    () => import('@/components/admin/AdminSidebar'),
  ],

  // High priority - preload on mouseover
  highPriority: [
    () => import('@/pages/admin/AllChats'),
    () => import('@/pages/admin/Dashboard'),
    () => import('@/components/admin/InteractiveWidget'),
  ],

  // Medium priority - preload on focus or after delay
  mediumPriority: [
    () => import('@/pages/admin/settings/WidgetManagement'),
    () => import('@/pages/admin/EngagementHistory'),
    () => import('@/components/admin/agent-console/AgentConsoleLayout'),
  ],

  // Low priority - preload on idle
  lowPriority: [
    () => import('@/pages/admin/content/Documents'),
    () => import('@/pages/admin/content/FAQs'),
    () => import('@/pages/admin/content/Resources'),
    () => import('@/pages/admin/settings/Users'),
    () => import('@/pages/admin/settings/Organizations'),
  ],

  // Heavy components - only load when needed
  onDemand: [
    () => import('@/components/ui/chart'),
    () => import('@/pages/admin/content/URLScraper'),
    () => import('@/components/admin/agent-console/EmailComposer'),
  ]
};

// ============= Bundle Analysis Utilities =============

export const bundleAnalysis = {
  // Log bundle sizes in development
  logBundleSizes: () => {
    if (process.env.NODE_ENV === 'development') {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      console.group('Bundle Analysis');
      console.log('Navigation timing:', navigationEntries[0]);
      console.log('Resource count:', resourceEntries.length);
      console.log('JS resources:', resourceEntries.filter(entry => entry.name.includes('.js')).length);
      console.log('CSS resources:', resourceEntries.filter(entry => entry.name.includes('.css')).length);
      console.groupEnd();
    }
  },

  // Measure chunk loading performance
  measureChunkLoading: (chunkName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`[Bundle] ${chunkName} loaded in ${end - start}ms`);
    };
  }
};

// ============= Dynamic Import Helpers =============

export const dynamicImport = {
  // Import with fallback
  withFallback: async <T>(
    importFn: () => Promise<T>,
    fallback: T
  ): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('Dynamic import failed, using fallback:', error);
      return fallback;
    }
  },

  // Import with timeout
  withTimeout: async <T>(
    importFn: () => Promise<T>,
    timeout: number = 5000
  ): Promise<T> => {
    return Promise.race([
      importFn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Import timeout')), timeout)
      )
    ]);
  },

  // Preload with priority
  preload: (importFn: () => Promise<any>, priority: 'high' | 'low' = 'low') => {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(
        () => importFn().catch(() => {}),
        { priority: priority === 'high' ? 'user-blocking' : 'background' }
      );
    } else {
      // Fallback for browsers without scheduler API
      const delay = priority === 'high' ? 0 : 2000;
      setTimeout(() => importFn().catch(() => {}), delay);
    }
  }
};

// ============= Auto Preloading =============

// Automatically preload critical components after initial load
export const initializePreloading = () => {
  // Preload critical components immediately
  setTimeout(() => {
    preloadStrategies.critical.forEach(importFn => {
      dynamicImport.preload(importFn, 'high');
    });
  }, 100);

  // Preload high priority components after a short delay
  setTimeout(() => {
    preloadStrategies.highPriority.forEach(importFn => {
      dynamicImport.preload(importFn, 'high');
    });
  }, 1000);

  // Preload medium priority components when idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadStrategies.mediumPriority.forEach(importFn => {
        dynamicImport.preload(importFn, 'low');
      });
    });
  } else {
    setTimeout(() => {
      preloadStrategies.mediumPriority.forEach(importFn => {
        dynamicImport.preload(importFn, 'low');
      });
    }, 3000);
  }

  // Preload low priority components when really idle
  setTimeout(() => {
    preloadStrategies.lowPriority.forEach(importFn => {
      dynamicImport.preload(importFn, 'low');
    });
  }, 5000);
};

// ============= Performance Monitoring =============

export const performanceMonitoring = {
  // Monitor lazy loading performance
  trackLazyLoading: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Lazy Loading] ${componentName} loaded in ${end - start}ms`);
      }
    };
  },

  // Monitor bundle impact
  trackBundleImpact: () => {
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('chunk')) {
            console.log(`[Bundle] Chunk loaded: ${entry.name} (${entry.duration}ms)`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
};