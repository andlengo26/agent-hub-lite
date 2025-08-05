/**
 * Test Setup Configuration
 * Global test environment setup and configuration
 */

import '@testing-library/jest-dom';
import { TestEnvironment } from '../lib/testing';

// Setup test environment
beforeAll(() => {
  TestEnvironment.setup();
  TestEnvironment.mockApis();
});

// Cleanup after tests
afterAll(() => {
  TestEnvironment.cleanup();
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.TestUtils = {
  createMockComponent: (name: string) => {
    return () => React.createElement('div', { 'data-testid': name }, `Mock ${name}`);
  },
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import React from 'react';