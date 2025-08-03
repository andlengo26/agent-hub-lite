/**
 * Test utilities for React Testing Library
 * Provides custom render function with necessary providers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock implementations for common hooks
export const mockUseFeatureFlag = (flags: Record<string, boolean> = {}) => {
  const defaultFlags = {
    chat: true,
    analytics: false,
    multiTenant: false,
    realTime: false,
    aiLifecycle: true,
    ...flags,
  };

  return jest.fn((flag: string) => defaultFlags[flag] ?? false);
};

export const mockUseApiQuery = (data: any = {}, loading: boolean = false, error: any = null) => ({
  data,
  isLoading: loading,
  error,
  refetch: jest.fn(),
});

export const createMockChat = (overrides: any = {}) => ({
  id: 'chat_001',
  requesterName: 'John Doe',
  requesterEmail: 'john@example.com',
  status: 'active',
  lastMessage: 'Hello there',
  lastMessageTime: new Date().toISOString(),
  unreadCount: 0,
  assignedAgent: null,
  ...overrides,
});

export const createMockEngagement = (overrides: any = {}) => ({
  id: 'eng_001',
  customerId: 'cust_001',
  customerName: 'Jane Smith',
  status: 'active',
  type: 'chat',
  startedAt: new Date().toISOString(),
  lastActivity: new Date().toISOString(),
  messageCount: 5,
  tags: [],
  ...overrides,
});