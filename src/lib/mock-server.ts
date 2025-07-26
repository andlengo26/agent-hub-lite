/**
 * Mock Service Worker (MSW) setup for API mocking
 * Provides realistic API responses for development and testing
 */

import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import config from './config';
import { mockData } from './mock-data';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API response wrapper
const createApiResponse = (data: any, pagination?: any) => {
  return {
    data,
    ...(pagination && { pagination }),
    timestamp: new Date().toISOString(),
    success: true
  };
};

// Mock API handlers
export const handlers = [
  // Health check endpoints - MUST be first to catch health checks
  http.get('/health', async () => {
    console.log('🎭 Health check hit: /health');
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
  }),
  
  http.get('/api/mock/health', async () => {
    console.log('🎭 Health check hit: /api/mock/health');
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
  }),
  // GET /api/mock/chats
  http.get('/api/mock/chats', async ({ request }) => {
    console.log('🎭 Mock server intercepted GET /api/mock/chats');
    await delay(config.mock.apiDelay);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    console.log('🎭 Chat request params:', { page, limit, status });
    
    let filteredChats = mockData.chats;
    if (status) {
      filteredChats = mockData.chats.filter(chat => chat.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedChats = filteredChats.slice(startIndex, endIndex);
    
    const pagination = {
      page,
      limit,
      total: filteredChats.length,
      totalPages: Math.ceil(filteredChats.length / limit)
    };
    
    console.log(`🎭 Returning ${paginatedChats.length} chats of ${filteredChats.length} total`);
    return HttpResponse.json(createApiResponse(paginatedChats, pagination));
  }),

  // GET /api/mock/chats/:chatId
  http.get('/api/mock/chats/:chatId', async ({ params }) => {
    await delay(config.mock.apiDelay);
    
    const chat = mockData.chats.find(c => c.id === params.chatId);
    if (!chat) {
      return HttpResponse.json(
        { message: 'Chat not found', code: 'CHAT_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(createApiResponse(chat));
  }),

  // POST /api/mock/chats
  http.post('/api/mock/chats', async ({ request }) => {
    await delay(config.mock.apiDelay);
    
    const body = await request.json() as any;
    const newChat = {
      id: `chat_${Date.now()}`,
      customerId: body.customerId,
      customerName: mockData.users.find(u => u.id === body.customerId)?.firstName + ' ' + mockData.users.find(u => u.id === body.customerId)?.lastName || 'Unknown Customer',
      customerEmail: mockData.users.find(u => u.id === body.customerId)?.email || 'unknown@example.com',
      requesterName: mockData.users.find(u => u.id === body.customerId)?.firstName + ' ' + mockData.users.find(u => u.id === body.customerId)?.lastName || 'Unknown Customer',
      requesterEmail: mockData.users.find(u => u.id === body.customerId)?.email || 'unknown@example.com',
      requesterPhone: '+1-555-0000',
      ipAddress: '192.168.1.999',
      browser: 'Unknown Browser',
      pageUrl: 'https://example.com',
      subject: body.subject,
      status: 'active' as const,
      priority: body.priority || 'medium' as const,
      assignedAgentId: 'agent_001',
      lastMessage: 'Chat started',
      messageCount: 1,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };
    
    // Add to mock data (in-memory only)
    mockData.chats.unshift(newChat as any);
    
    return HttpResponse.json(createApiResponse(newChat), { status: 201 });
  }),

  // GET /api/mock/users
  http.get('/api/mock/users', async ({ request }) => {
    console.log('🎭 Mock server intercepted GET /api/mock/users');
    await delay(config.mock.apiDelay);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    console.log('🎭 User request params:', { page, limit });
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = mockData.users.slice(startIndex, endIndex);
    
    const pagination = {
      page,
      limit,
      total: mockData.users.length,
      totalPages: Math.ceil(mockData.users.length / limit)
    };
    
    console.log(`🎭 Returning ${paginatedUsers.length} users of ${mockData.users.length} total`);
    return HttpResponse.json(createApiResponse(paginatedUsers, pagination));
  }),

  // GET /api/mock/organizations
  http.get('/api/mock/organizations', async () => {
    await delay(config.mock.apiDelay);
    return HttpResponse.json(createApiResponse(mockData.organizations));
  }),

  // POST /api/mock/organizations
  http.post('/api/mock/organizations', async ({ request }) => {
    await delay(config.mock.apiDelay);
    
    const body = await request.json() as any;
    const newOrganization = {
      id: `org_${Date.now()}`,
      name: body.name,
      logoUrl: body.logoUrl || '/placeholder.svg',
      activeAgents: 0,
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };
    
    // Add to mock data (in-memory only)
    mockData.organizations.unshift(newOrganization as any);
    
    return HttpResponse.json(createApiResponse(newOrganization), { status: 201 });
  }),

  // PUT /api/mock/organizations/:orgId
  http.put('/api/mock/organizations/:orgId', async ({ params, request }) => {
    await delay(config.mock.apiDelay);
    
    const body = await request.json() as any;
    const orgIndex = mockData.organizations.findIndex(o => o.id === params.orgId);
    
    if (orgIndex === -1) {
      return HttpResponse.json(
        { message: 'Organization not found', code: 'ORG_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    mockData.organizations[orgIndex] = {
      ...mockData.organizations[orgIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(createApiResponse(mockData.organizations[orgIndex]));
  }),

  // DELETE /api/mock/organizations/:orgId
  http.delete('/api/mock/organizations/:orgId', async ({ params }) => {
    await delay(config.mock.apiDelay);
    
    const orgIndex = mockData.organizations.findIndex(o => o.id === params.orgId);
    if (orgIndex === -1) {
      return HttpResponse.json(
        { message: 'Organization not found', code: 'ORG_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    mockData.organizations.splice(orgIndex, 1);
    return HttpResponse.json(createApiResponse({ success: true }));
  }),

  // POST /api/mock/users (invite user)
  http.post('/api/mock/users', async ({ request }) => {
    await delay(config.mock.apiDelay);
    
    const body = await request.json() as any;
    const newUser = {
      id: `user_${Date.now()}`,
      avatarUrl: '/placeholder.svg',
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role || 'agent' as const,
      onlineStatus: 'offline' as const,
      createdAt: new Date().toISOString()
    };
    
    // Add to mock data (in-memory only)
    mockData.users.unshift(newUser as any);
    
    return HttpResponse.json(createApiResponse(newUser), { status: 201 });
  }),

  // PUT /api/mock/users/:userId
  http.put('/api/mock/users/:userId', async ({ params, request }) => {
    await delay(config.mock.apiDelay);
    
    const body = await request.json() as any;
    const userIndex = mockData.users.findIndex(u => u.id === params.userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    mockData.users[userIndex] = {
      ...mockData.users[userIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(createApiResponse(mockData.users[userIndex]));
  }),

  // DELETE /api/mock/users/:userId
  http.delete('/api/mock/users/:userId', async ({ params }) => {
    await delay(config.mock.apiDelay);
    
    const userIndex = mockData.users.findIndex(u => u.id === params.userId);
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    mockData.users.splice(userIndex, 1);
    return HttpResponse.json(createApiResponse({ success: true }));
  }),

  // Duplicate health check at end for safety
  http.get('/api/mock/health', async () => {
    console.log('🎭 Fallback health check hit: /api/mock/health');
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }),
];

// Create and export the worker
export const worker = setupWorker(...handlers);

// Add diagnostic logging BEFORE starting the worker
worker.events.on('request:start', ({ request }) => {
  console.log('[MSW] intercepting', request.method, request.url);
});

worker.events.on('request:unhandled', ({ request }) => {
  console.warn('[MSW] missed', request.method, request.url);
});

// Simplified mock server startup focused on reliability
export const startMockServer = async (): Promise<boolean> => {
  console.log('🎭 === MOCK SERVER STARTUP ===');
  
  try {
    console.log('🎭 Pre-flight checks...');
    console.log('🎭 - Service Worker API available:', 'serviceWorker' in navigator);
    console.log('🎭 - Current origin:', window.location.origin);
    console.log('🎭 - Handlers registered:', handlers.length);
    
    // List all registered handlers for debugging
    console.log('🎭 - Registered handlers:');
    handlers.forEach((handler, index) => {
      console.log(`🎭   ${index + 1}. ${handler.info.method || 'unknown'} ${handler.info.path || 'unknown'}`);
    });
    
    // Check if mockServiceWorker.js is accessible
    try {
      const swResponse = await fetch('/mockServiceWorker.js', { method: 'HEAD' });
      console.log('🎭 - Service Worker file status:', swResponse.status);
      if (!swResponse.ok) {
        console.warn('⚠️ mockServiceWorker.js not found - ensure it exists in public/ directory');
        console.warn('⚠️ To fix: run `npx msw init public/` in project root');
      }
    } catch (swError) {
      console.warn('⚠️ Cannot check mockServiceWorker.js:', swError.message);
    }
    
    console.log('🎭 Starting MSW worker...');
    
    // Start with minimal but reliable configuration
    await worker.start({
      onUnhandledRequest: ({ method, url }) => {
        // Only warn about actual API requests, not static assets
        if (url.includes('/api/')) {
          console.warn(`🎭 UNHANDLED API REQUEST: ${method} ${url}`);
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
          type: 'classic'
        }
      },
      quiet: false
    });
    
    console.log('✅ MSW worker started successfully');
    console.log('🎭 Active handlers:', worker.listHandlers().length);
    
    // Give worker time to fully initialize
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return true;
  } catch (error) {
    console.error('❌ === MOCK SERVER STARTUP FAILED ===');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    
    // Specific error handling
    if (error.message.includes('not found') || error.message.includes('404')) {
      console.error('❌ Solution: Run `npx msw init public/` to generate mockServiceWorker.js');
    }
    if (error.message.includes('registration failed')) {
      console.error('❌ Solution: Check browser service worker support and HTTPS requirements');
    }
    
    return false;
  }
};

// Helper to stop mock server
export const stopMockServer = () => {
  if (config.mock.enabled) {
    worker.stop();
    console.log('🎭 Mock API server stopped');
  }
};