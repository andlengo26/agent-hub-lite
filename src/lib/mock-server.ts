/**
 * Enhanced Mock Service Worker (MSW) setup with robust error handling
 * Provides realistic API responses for development and testing
 */

import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import config from './config';
import { mockData } from './mock-data';

// MSW initialization state tracking
interface MSWState {
  isInitialized: boolean;
  isStarted: boolean;
  startTime: number | null;
  error: Error | null;
}

const mswState: MSWState = {
  isInitialized: false,
  isStarted: false,
  startTime: null,
  error: null,
};

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

// Enhanced logging for MSW debugging
const logMSWRequest = (method: string, url: string, intercepted: boolean = true) => {
  const prefix = intercepted ? '🎭 MSW INTERCEPTED' : '❌ MSW MISSED';
  console.log(`${prefix}: ${method} ${url}`);
  if (!intercepted) {
    console.warn('⚠️ Request not intercepted by MSW - check service worker status');
  }
};

// Service Worker status check
const checkServiceWorkerStatus = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('🔧 Service Worker registrations:', registrations.length);
      registrations.forEach((registration, index) => {
        console.log(`🔧 SW ${index + 1}:`, {
          scope: registration.scope,
          active: !!registration.active,
          waiting: !!registration.waiting,
          installing: !!registration.installing,
          state: registration.active?.state
        });
      });
      
      if (registrations.length === 0) {
        console.warn('⚠️ No service workers registered - MSW may not work');
      }
    }).catch(err => {
      console.error('❌ Failed to get service worker registrations:', err);
    });
  } else {
    console.warn('⚠️ Service Worker API not available');
  }
};

// Fallback mechanism for when MSW fails
export const getFallbackData = (endpoint: string): any => {
  console.log('🔄 Using fallback data for:', endpoint);
  
  switch (true) {
    case endpoint.includes('/chats'):
      if (endpoint.includes('?')) {
        // Parse query params for pagination
        const url = new URL(endpoint, 'http://localhost');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedChats = mockData.chats.slice(startIndex, endIndex);
        
        return createApiResponse(paginatedChats, {
          page,
          limit,
          total: mockData.chats.length,
          totalPages: Math.ceil(mockData.chats.length / limit)
        });
      }
      return createApiResponse(mockData.chats.slice(0, 10));
      
    case endpoint.includes('/users'):
      return createApiResponse(mockData.users.slice(0, 10));
      
    case endpoint.includes('/organizations'):
      return createApiResponse(mockData.organizations);
      
    case endpoint.includes('/health'):
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        source: 'fallback'
      };
      
    default:
      return createApiResponse([]);
  }
};

// Enhanced Mock API handlers with detailed logging
export const handlers = [
  // GET /api/mock/chats
  http.get('/api/mock/chats', async ({ request }) => {
    logMSWRequest('GET', '/api/mock/chats', true);
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
    logMSWRequest('GET', `/api/mock/chats/${params.chatId}`, true);
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
    logMSWRequest('POST', '/api/mock/chats', true);
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
    logMSWRequest('GET', '/api/mock/users', true);
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
    logMSWRequest('GET', '/api/mock/organizations', true);
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
    logMSWRequest('GET', '/api/mock/health', true);
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      msw: {
        isStarted: mswState.isStarted,
        startTime: mswState.startTime,
        handlersCount: handlers.length
      }
    });
  }),
];

// Create and export the worker
export const worker = setupWorker(...handlers);

// Enhanced initialization with proper error handling and verification
export const initializeMSW = async (): Promise<boolean> => {
  if (!config.mock.enabled) {
    console.log('🎭 Mock server disabled in config');
    return false;
  }

  console.log('🎭 Initializing Mock Service Worker...');
  
  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker not supported in this browser');
    mswState.error = new Error('Service Worker not supported');
    return false;
  }

  try {
    mswState.isInitialized = true;
    mswState.startTime = Date.now();
    
    // Start MSW with enhanced configuration
    await worker.start({
      onUnhandledRequest: (req, print) => {
        // Log unhandled requests for debugging
        console.warn('🔍 Unhandled request:', req.method, req.url);
        logMSWRequest(req.method, req.url, false);
        print.warning();
      },
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/'
        }
      },
      quiet: false // Enable logging for debugging
    });

    mswState.isStarted = true;
    console.log('✅ Mock Service Worker started successfully');
    console.log(`🎭 MSW Configuration:`, {
      enabled: config.mock.enabled,
      handlersCount: handlers.length,
      apiDelay: config.mock.apiDelay,
      startTime: new Date(mswState.startTime).toISOString()
    });

    // Verify service worker status
    setTimeout(() => {
      checkServiceWorkerStatus();
      
      // Test MSW with a health check
      console.log('🧪 Testing MSW with health check...');
      fetch('/api/mock/health')
        .then(response => {
          if (response.ok) {
            console.log('✅ MSW health check passed');
          } else {
            console.warn('⚠️ MSW health check failed:', response.status);
          }
        })
        .catch(error => {
          console.error('❌ MSW health check error:', error);
        });
    }, 1000);

    return true;
  } catch (error) {
    console.error('❌ Failed to start Mock Service Worker:', error);
    mswState.error = error as Error;
    mswState.isStarted = false;
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    console.log('🔄 Continuing with fallback mechanism');
    return false;
  }
};

// Helper to start mock server (for backwards compatibility)
export const startMockServer = async () => {
  return await initializeMSW();
};

// Check if MSW is working correctly
export const verifyMSW = (): boolean => {
  return mswState.isStarted && !mswState.error;
};

// Get MSW status for debugging
export const getMSWStatus = () => {
  return {
    ...mswState,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    timestamp: new Date().toISOString()
  };
};

// Helper to stop mock server
export const stopMockServer = () => {
  if (config.mock.enabled && mswState.isStarted) {
    worker.stop();
    mswState.isStarted = false;
    mswState.startTime = null;
    console.log('🎭 Mock API server stopped');
  }
};