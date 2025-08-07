/**
 * Lazy Loading Component Utilities
 * Dynamic imports and code splitting for performance
 */

import { Suspense, lazy, ComponentType, ReactNode, FC, forwardRef, useState, useRef, useEffect, DependencyList } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Generic lazy loading wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <DefaultLazyFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Default loading fallback
export const DefaultLazyFallback: FC = () => (
  <Card className="p-6">
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  </Card>
);

// Skeleton fallback for different component types
export const SkeletonFallback: FC<{
  type?: 'table' | 'form' | 'card' | 'list';
  lines?: number;
}> = ({ type = 'card', lines = 3 }) => {
  switch (type) {
    case 'table':
      return (
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      );
    
    case 'form':
      return (
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>
      );
    
    case 'list':
      return (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    
    default:
      return (
        <Card className="p-6">
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>
      );
  }
};

// Higher-order component for lazy loading with intersection observer
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: {
    fallback?: ReactNode;
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const { fallback = <DefaultLazyFallback />, rootMargin = '50px', threshold = 0.1 } = options;
  
  return forwardRef<any, P & { lazy?: boolean }>((props, ref) => {
    const { lazy = true, ...componentProps } = props;
    const [isVisible, setIsVisible] = useState(!lazy);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!lazy || isVisible) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin, threshold }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [lazy, isVisible, rootMargin, threshold]);

    if (!isVisible) {
      return <div ref={elementRef}>{fallback}</div>;
    }

    return <Component {...(componentProps as P)} ref={ref} />;
  });
}

// Lazy loading hook for components
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  deps: DependencyList = []
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    importFn()
      .then(module => {
        if (!cancelled) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { Component, loading, error };
}

// Simplified lazy imports - removed for now to avoid complex type issues
export const LazyImports = {
  // These will be implemented as direct React.lazy calls in components that need them
};

// Pre-built lazy components - simplified approach
export const LazyChatPanel = lazy(() => 
  import('@/components/admin/ChatPanel').then(m => ({ 
    default: (m as any).ChatPanel || (m as any).default || (() => <DefaultLazyFallback />) 
  }))
);

export const LazyEngagementAccordion = lazy(() => 
  import('@/components/admin/EngagementAccordion').then(m => ({ 
    default: (m as any).EngagementAccordion || (m as any).default || (() => <DefaultLazyFallback />) 
  }))
);

export const LazyAgentConsole = lazy(() => 
  import('@/components/admin/agent-console/AgentConsoleLayout').then(m => ({ 
    default: (m as any).AgentConsoleLayout || (m as any).default || (() => <DefaultLazyFallback />) 
  }))
);

export const LazyWidgetSettings = lazy(() => 
  import('@/pages/admin/settings/WidgetManagement').then(m => ({ 
    default: (m as any).default || (() => <DefaultLazyFallback />) 
  }))
);

export const LazyInteractiveWidget = lazy(() => 
  import('@/components/widget/InteractiveWidget').then(m => ({ 
    default: (m as any).InteractiveWidget || (m as any).default || (() => <DefaultLazyFallback />) 
  }))
);

// Preload utility for better UX
export const preloadComponent = (importFn: () => Promise<any>) => {
  // Preload on mouseover or focus for better perceived performance
  return () => {
    importFn().catch(() => {
      // Silently fail preloading, component will load normally when needed
    });
  };
};

// Resource preloading hook
export function usePreloadResources(resources: Array<() => Promise<any>>, delay: number = 2000) {
  useEffect(() => {
    const timer = setTimeout(() => {
      resources.forEach(resource => {
        resource().catch(() => {
          // Ignore preload errors
        });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [resources, delay]);
}