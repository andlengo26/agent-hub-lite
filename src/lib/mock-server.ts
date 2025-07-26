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
    await delay(config.mock.apiDelay);
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = mockData.users.slice(startIndex, endIndex);
    
    const pagination = {
      page,
      limit,
      total: mockData.users.length,
      totalPages: Math.ceil(mockData.users.length / limit)
    };
    
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

  // Health check endpoint
  http.get('/api/mock/health', async () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }),
];

// Create and export the worker
export const worker = setupWorker(...handlers);

// Add diagnostic logs
worker.events.on('request:start', (req) =>
  console.log('🎭 [MSW] Request:', req.request.method, req.request.url)
);

worker.events.on('request:match', (req) =>
  console.log('🎭 [MSW] Matched:', req.request.method, req.request.url)
);

worker.events.on('request:unhandled', (req) =>
  console.warn('🎭 [MSW] Unhandled:', req.request.method, req.request.url)
);

worker.events.on('response:mocked', (res) =>
  console.log('🎭 [MSW] Mocked response:', res.response.status, res.request.url)
);

// Helper to start mock server (simplified for direct worker usage)
export const startMockServer = async () => {
  if (!config.mock.enabled) {
    console.log('🎭 Mock server disabled in config');
    return false;
  }

  try {
    console.log('🎭 Starting Mock Service Worker...');
    
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
        }
      },
      waitUntilReady: true,
    });
    
    console.log('🎭 Mock API server started successfully');
    console.log('🎭 Mock enabled:', config.mock.enabled);
    console.log('🎭 Available handlers:', handlers.length);
    console.log('🎭 Service worker scope: /');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to start mock server:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.log('🎭 Continuing without mock server - API calls will use fallback data');
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