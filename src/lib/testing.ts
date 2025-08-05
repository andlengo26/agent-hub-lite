/**
 * Testing Infrastructure - Integrated System
 * Combines performance monitoring with comprehensive testing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { performanceMonitor } from './performance-monitoring';
import { TestUtils, MockDataGenerators } from '../utils/test-framework';

// Test environment setup
export const TestEnvironment = {
  // Setup test environment
  setup: () => {
    // Mock performance API if not available
    if (typeof window !== 'undefined' && !window.performance) {
      (global as any).performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByType: () => [],
        getEntriesByName: () => []
      };
    }

    // Setup performance monitoring for tests
    performanceMonitor.start();
  },

  // Cleanup test environment
  cleanup: () => {
    performanceMonitor.stop();
    performanceMonitor.clear();
  },

  // Mock common APIs
  mockApis: () => {
    // Mock fetch
    global.fetch = jest.fn();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }
};

// Performance testing utilities
export const PerformanceTestRunner = {
  // Test component render performance
  testRenderPerformance: async (
    componentName: string,
    renderComponent: () => React.ReactElement,
    maxRenderTime = 16 // 60fps target
  ) => {
    const startTime = performance.now();
    const { unmount } = render(renderComponent());
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(maxRenderTime);
    
    unmount();
    return renderTime;
  },

  // Test memory usage
  testMemoryUsage: async (
    componentName: string,
    renderComponent: () => React.ReactElement,
    iterations = 10
  ) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(renderComponent());
      unmount();
    }

    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryDiff = finalMemory - initialMemory;
    
    // Memory should not increase significantly
    expect(memoryDiff).toBeLessThan(1024 * 1024); // 1MB threshold
    
    return memoryDiff;
  },

  // Test virtual scrolling performance
  testVirtualScrolling: async (itemCount: number, itemHeight: number) => {
    const startTime = performance.now();
    
    // Simulate virtual scrolling calculations
    const containerHeight = 400;
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const totalHeight = itemCount * itemHeight;
    
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    
    expect(calculationTime).toBeLessThan(1); // Should be very fast
    
    return {
      calculationTime,
      visibleItems,
      totalHeight,
      itemsOutsideView: itemCount - visibleItems
    };
  }
};

// Integration test utilities
export const IntegrationTestRunner = {
  // Test API integration
  testApiIntegration: async (
    apiCall: () => Promise<any>,
    expectedResponse: any
  ) => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse
    });
    
    global.fetch = mockFetch;
    
    const result = await apiCall();
    
    expect(result).toEqual(expectedResponse);
    expect(mockFetch).toHaveBeenCalled();
  },

  // Test component integration
  testComponentIntegration: async (
    parentComponent: React.ReactElement,
    childSelector: string,
    interaction: (element: HTMLElement) => Promise<void>
  ) => {
    render(parentComponent);
    
    const childElement = await screen.findByTestId(childSelector);
    expect(childElement).toBeInTheDocument();
    
    await interaction(childElement);
  },

  // Test real-time updates
  testRealTimeUpdates: async (
    component: React.ReactElement,
    updateTrigger: () => void,
    expectedChange: () => Promise<void>
  ) => {
    render(component);
    
    updateTrigger();
    
    await expectedChange();
  }
};

// Accessibility testing
export const AccessibilityTestRunner = {
  // Test keyboard navigation
  testKeyboardNavigation: async (component: React.ReactElement) => {
    const { container } = render(component);
    const user = userEvent.setup();
    
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    // Test tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      await user.tab();
      expect(focusableElements[i]).toHaveFocus();
    }
  },

  // Test ARIA attributes
  testAriaAttributes: (component: React.ReactElement) => {
    const { container } = render(component);
    
    const interactiveElements = container.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="link"]'
    );
    
    interactiveElements.forEach(element => {
      const hasAriaLabel = element.hasAttribute('aria-label') || 
                          element.hasAttribute('aria-labelledby') ||
                          element.closest('label') !== null;
      
      expect(hasAriaLabel).toBe(true);
    });
  },

  // Test color contrast
  testColorContrast: (component: React.ReactElement) => {
    const { container } = render(component);
    
    // Basic contrast check (simplified)
    const textElements = container.querySelectorAll('*');
    
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Ensure text is not invisible
      expect(color).not.toBe(backgroundColor);
    });
  }
};

// Test suite runner
export const TestSuiteRunner = {
  // Run comprehensive component tests
  runComponentTests: async (
    componentName: string,
    component: React.ReactElement,
    options: {
      testPerformance?: boolean;
      testAccessibility?: boolean;
      testIntegration?: boolean;
      maxRenderTime?: number;
    } = {}
  ) => {
    const {
      testPerformance = true,
      testAccessibility = true,
      testIntegration = false,
      maxRenderTime = 16
    } = options;

    const results: Record<string, any> = {};

    // Basic render test
    results.render = () => {
      render(component);
      expect(screen.getByRole('main')).toBeInTheDocument();
    };

    // Performance tests
    if (testPerformance) {
      results.performance = await PerformanceTestRunner.testRenderPerformance(
        componentName,
        () => component,
        maxRenderTime
      );
    }

    // Accessibility tests
    if (testAccessibility) {
      results.accessibility = {
        keyboard: () => AccessibilityTestRunner.testKeyboardNavigation(component),
        aria: () => AccessibilityTestRunner.testAriaAttributes(component),
        contrast: () => AccessibilityTestRunner.testColorContrast(component)
      };
    }

    return results;
  },

  // Run performance benchmark
  runPerformanceBenchmark: async (
    tests: Array<{
      name: string;
      component: React.ReactElement;
      iterations?: number;
    }>
  ) => {
    const results: Record<string, any> = {};

    for (const test of tests) {
      const iterations = test.iterations || 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const renderTime = await PerformanceTestRunner.testRenderPerformance(
          test.name,
          () => test.component
        );
        times.push(renderTime);
      }

      results[test.name] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        iterations: iterations
      };
    }

    return results;
  }
};

// Export test utilities
export {
  TestUtils,
  MockDataGenerators,
  render,
  screen,
  fireEvent,
  waitFor,
  userEvent
};