/**
 * Testing Framework - Phase 7
 * Comprehensive testing utilities and infrastructure
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import React, { type ReactElement } from 'react';

// Mock data generators
export const MockDataGenerators = {
  // User data
  createMockUser: (overrides = {}) => ({
    id: 'user_001',
    email: 'test@example.com',
    name: 'Test User',
    role: 'agent' as const,
    onlineStatus: 'online' as const,
    createdAt: new Date().toISOString(),
    organizationId: 'org_001',
    ...overrides
  }),

  // Chat data
  createMockChat: (overrides = {}) => ({
    id: 'chat_001',
    customerId: 'customer_001',
    requesterName: 'John Doe',
    requesterEmail: 'john@example.com',
    requesterPhone: '+1234567890',
    ipAddress: '192.168.1.1',
    status: 'active' as const,
    assignedTo: null,
    handledBy: 'ai' as const,
    priority: 'medium' as const,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: 'Hello, I need help',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    ...overrides
  }),

  // Engagement data
  createMockEngagement: (overrides = {}) => ({
    id: 'engagement_001',
    customerId: 'customer_001',
    customerName: 'Jane Smith',
    status: 'active' as const,
    type: 'chat' as const,
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    messageCount: 5,
    tags: [],
    ...overrides
  }),

  // Message data
  createMockMessage: (overrides = {}) => ({
    id: 'message_001',
    type: 'user' as const,
    content: 'Test message',
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Organization data
  createMockOrganization: (overrides = {}) => ({
    id: 'org_001',
    name: 'Test Organization',
    domain: 'test.com',
    settings: {},
    createdAt: new Date().toISOString(),
    ...overrides
  })
};

// Test utilities for common operations
export const TestUtils = {
  // Simulate user interactions
  async typeInInput(element: HTMLElement, text: string) {
    const user = userEvent.setup();
    await user.clear(element);
    await user.type(element, text);
  },

  async clickButton(buttonText: string) {
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: buttonText });
    await user.click(button);
  },

  async selectOption(selectElement: HTMLElement, optionText: string) {
    const user = userEvent.setup();
    await user.click(selectElement);
    await user.click(screen.getByText(optionText));
  },

  // Wait for async operations
  async waitForLoading() {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  },

  async waitForElement(selector: string, timeout = 5000) {
    return await waitFor(() => screen.getByTestId(selector), { timeout });
  },

  // Form testing utilities
  async fillForm(formData: Record<string, string>) {
    const user = userEvent.setup();
    
    for (const [field, value] of Object.entries(formData)) {
      const input = screen.getByLabelText(new RegExp(field, 'i'));
      await user.clear(input);
      await user.type(input, value);
    }
  },

  async submitForm() {
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
    await user.click(submitButton);
  }
};

// Performance testing utilities
export const PerformanceTestUtils = {
  // Measure component render time
  measureRenderTime: (component: ReactElement) => {
    const startTime = performance.now();
    render(component);
    const endTime = performance.now();
    return endTime - startTime;
  },

  // Test for memory leaks
  checkMemoryLeaks: (component: ReactElement, iterations = 100) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(component);
      unmount();
    }
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    return finalMemory - initialMemory;
  },

  // Test virtual scrolling performance
  testVirtualScrollPerformance: async (itemCount: number) => {
    const startTime = performance.now();
    
    // Simulate large dataset rendering
    const items = Array.from({ length: itemCount }, (_, i) => ({ id: `item_${i}` }));
    
    const { container } = render(
      React.createElement('div', { 'data-testid': 'virtual-scroll-container' },
        items.slice(0, 10).map(item => 
          React.createElement('div', { key: item.id }, item.id)
        )
      )
    );
    
    const endTime = performance.now();
    
    return {
      renderTime: endTime - startTime,
      renderedItems: container.children.length,
      totalItems: itemCount
    };
  }
};

// Accessibility testing utilities
export const AccessibilityTestUtils = {
  // Check for proper ARIA labels
  checkAriaLabels: (container: HTMLElement) => {
    const elementsNeedingLabels = container.querySelectorAll('button, input, select, textarea');
    const unlabeled: Element[] = [];
    
    elementsNeedingLabels.forEach(element => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasLabel = element.closest('label') || document.querySelector(`label[for="${element.id}"]`);
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasLabel) {
        unlabeled.push(element);
      }
    });
    
    return unlabeled;
  },

  // Check keyboard navigation
  testKeyboardNavigation: async (container: HTMLElement) => {
    const user = userEvent.setup();
    const focusableSelector = 'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelector);
    
    if (focusableElements.length === 0) return true;
    
    // Tab through all focusable elements
    for (let i = 0; i < focusableElements.length; i++) {
      await user.tab();
      await waitFor(() => {
        expect(focusableElements[i]).toHaveFocus();
      });
    }
    
    return true;
  },

  // Check color contrast (simplified)
  checkColorContrast: (container: HTMLElement) => {
    const elements = container.querySelectorAll('*');
    const contrastIssues: Element[] = [];
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Simple contrast check (in real scenario, use a proper contrast calculation)
      if (color === backgroundColor || (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)')) {
        contrastIssues.push(element);
      }
    });
    
    return contrastIssues;
  }
};

// Integration testing utilities
export const IntegrationTestUtils = {
  // Mock API responses
  mockApiResponse: (data: any, delay = 0) => {
    return jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data }), delay))
    );
  },

  // Mock failed API responses
  mockApiError: (error: string, status = 500) => {
    return jest.fn().mockRejectedValue({
      response: { status, data: { message: error } }
    });
  },

  // Test real-time updates
  simulateRealTimeUpdate: (callback: Function, data: any, delay = 1000) => {
    setTimeout(() => callback(data), delay);
  },

  // Test component interactions
  testComponentInteraction: async (
    triggerAction: () => Promise<void>,
    expectedOutcome: () => Promise<void>
  ) => {
    await triggerAction();
    await expectedOutcome();
  }
};

// Test suite generators
export const TestSuiteGenerators = {
  // Generate standard component tests
  generateComponentTests: (componentName: string, component: ReactElement) => {
    return {
      'should render without crashing': () => {
        render(component);
      },
      
      'should be accessible': async () => {
        const { container } = render(component);
        const unlabeled = AccessibilityTestUtils.checkAriaLabels(container);
        expect(unlabeled).toHaveLength(0);
      },
      
      'should support keyboard navigation': async () => {
        const { container } = render(component);
        await AccessibilityTestUtils.testKeyboardNavigation(container);
      },
      
      'should render in reasonable time': () => {
        const renderTime = PerformanceTestUtils.measureRenderTime(component);
        expect(renderTime).toBeLessThan(100); // 100ms threshold
      }
    };
  },

  // Generate form tests
  generateFormTests: (formComponent: ReactElement, validData: Record<string, string>) => {
    return {
      'should accept valid input': async () => {
        render(formComponent);
        await TestUtils.fillForm(validData);
        await TestUtils.submitForm();
        // Add specific assertions based on form behavior
      },
      
      'should validate required fields': async () => {
        render(formComponent);
        await TestUtils.submitForm();
        // Check for validation errors
        expect(screen.queryByText(/required/i)).toBeInTheDocument();
      }
    };
  },

  // Generate API interaction tests
  generateApiTests: (apiFunction: Function, mockData: any) => {
    return {
      'should handle successful response': async () => {
        const mockResponse = IntegrationTestUtils.mockApiResponse(mockData);
        const result = await apiFunction();
        expect(result.data).toEqual(mockData);
      },
      
      'should handle error response': async () => {
        const mockError = IntegrationTestUtils.mockApiError('Server error');
        await expect(apiFunction()).rejects.toThrow();
      }
    };
  }
};

// Custom matchers for Jest
export const CustomMatchers = {
  toBeVisibleOnScreen: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    return {
      message: () => `expected element to be visible on screen`,
      pass: isVisible
    };
  },

  toHaveLoadedWithinTime: (element: HTMLElement, maxTime: number) => {
    const loadTime = parseInt(element.getAttribute('data-load-time') || '0');
    
    return {
      message: () => `expected element to load within ${maxTime}ms but took ${loadTime}ms`,
      pass: loadTime <= maxTime
    };
  }
};

// Test configuration
export const TestConfig = {
  // Default timeouts
  timeouts: {
    default: 5000,
    slow: 10000,
    integration: 15000
  },

  // Mock configuration
  mocks: {
    enableApiMocks: true,
    enableTimerMocks: false,
    enableLocalStorageMocks: true
  },

  // Performance thresholds
  performanceThresholds: {
    renderTime: 100, // ms
    memoryLeak: 1024 * 1024, // 1MB
    bundleSize: 500 * 1024 // 500KB
  }
};