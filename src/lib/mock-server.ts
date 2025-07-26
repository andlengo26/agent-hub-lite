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

// Enhanced mock server startup with robust error handling and recovery
export const startMockServer = async (): Promise<boolean> => {
  console.log('🎭 === MOCK SERVER STARTUP ===');
  
  try {
    console.log('🎭 Pre-flight diagnostics...');
    console.log('🎭 - Service Worker API available:', 'serviceWorker' in navigator);
    console.log('🎭 - Current origin:', window.location.origin);
    console.log('🎭 - Protocol:', window.location.protocol);
    console.log('🎭 - Handlers registered:', handlers.length);
    console.log('🎭 - Secure context:', window.isSecureContext);
    
    // List registered handlers for debugging (simplified to avoid TypeScript issues)
    console.log('🎭 - Registered API handlers:', handlers.length);
    console.log('🎭   - Health checks, chats, users, organizations endpoints configured');
    
    // Enhanced service worker file check
    await checkServiceWorkerFile();
    
    // Clear any existing service worker registration if needed
    await clearExistingRegistrations();
    
    console.log('🎭 Starting MSW worker with enhanced configuration...');
    
    // Start worker with comprehensive configuration
    await worker.start({
      onUnhandledRequest: ({ method, url }) => {
        // Filter out common static assets to reduce noise
        const staticAssets = ['.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff', '.ttf'];
        const isStaticAsset = staticAssets.some(ext => url.includes(ext));
        
        if (url.includes('/api/') && !isStaticAsset) {
          console.warn(`🎭 UNHANDLED API REQUEST: ${method} ${url}`);
          console.warn('🎭 Available handlers:', worker.listHandlers().length, 'registered');
          console.warn('🎭 Expected endpoints: /api/mock/health, /api/mock/chats, /api/mock/users, /api/mock/organizations');
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
          type: 'classic',
          updateViaCache: 'none' // Ensure fresh service worker
        }
      },
      waitUntilReady: true, // Wait for service worker to be ready
      quiet: false
    });
    
    console.log('✅ MSW worker started successfully');
    
    // Verify worker is properly initialized
    const activeHandlers = worker.listHandlers();
    console.log('🎭 Active handlers after start:', activeHandlers.length);
    
    if (activeHandlers.length === 0) {
      console.warn('⚠️ No handlers are active - this may indicate a problem');
    }
    
    // Wait for service worker to be fully ready and capable of intercepting
    await waitForWorkerReady();
    
    console.log('✅ MSW worker is fully ready and operational');
    return true;
    
  } catch (error) {
    console.error('❌ === MOCK SERVER STARTUP FAILED ===');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Enhanced error-specific guidance
    await provideTroubleshootingGuidance(error);
    
    return false;
  }
};

// Check if service worker file is accessible and valid
async function checkServiceWorkerFile(): Promise<void> {
  console.log('🎭 Checking service worker file...');
  
  try {
    const swResponse = await fetch('/mockServiceWorker.js', { 
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    console.log('🎭 - Service Worker file status:', swResponse.status);
    console.log('🎭 - Service Worker content-type:', swResponse.headers.get('content-type'));
    
    if (!swResponse.ok) {
      if (swResponse.status === 404) {
        throw new Error('mockServiceWorker.js not found - run `npx msw init public/` to generate it');
      } else {
        throw new Error(`Service worker file error: HTTP ${swResponse.status}`);
      }
    }
    
    // Additional check: try to fetch a small portion to verify it's valid JS
    const contentResponse = await fetch('/mockServiceWorker.js', { 
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Range': 'bytes=0-100' // Just first 100 bytes
      }
    });
    
    if (contentResponse.ok) {
      const snippet = await contentResponse.text();
      if (!snippet.includes('Mock Service Worker') && !snippet.includes('MSW')) {
        console.warn('⚠️ Service worker file may not be the correct MSW file');
      }
    }
    
    console.log('✅ Service worker file is accessible and appears valid');
    
  } catch (error) {
    console.error('❌ Service worker file check failed:', error.message);
    throw error;
  }
}

// Clear existing service worker registrations that might conflict
async function clearExistingRegistrations(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('🎭 Found existing service worker registrations:', registrations.length);
    
    for (const registration of registrations) {
      console.log('🎭 - Registration scope:', registration.scope);
      console.log('🎭 - Registration state:', registration.active?.state);
    }
    
    // Don't automatically unregister - just log for debugging
    console.log('🎭 Keeping existing registrations (MSW will update as needed)');
    
  } catch (error) {
    console.warn('⚠️ Could not check existing registrations:', error.message);
  }
}

// Wait for MSW worker to be fully operational
async function waitForWorkerReady(): Promise<void> {
  console.log('🎭 Waiting for MSW worker to be fully ready...');
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ Worker ready timeout - continuing anyway');
      resolve(); // Don't reject, just continue
    }, 3000);
    
    // Check if we already have an active service worker
    if (navigator.serviceWorker.controller) {
      console.log('✅ Service worker controller already active');
      clearTimeout(timeout);
      resolve();
      return;
    }
    
    // Listen for the service worker to become active
    const handleControllerChange = () => {
      console.log('✅ Service worker controller changed - now active');
      clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      resolve();
    };
    
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    
    // Also resolve after a reasonable time even without controllerchange
    setTimeout(() => {
      console.log('✅ Assuming worker is ready (timeout fallback)');
      clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      resolve();
    }, 1500);
  });
}

// Provide detailed troubleshooting guidance based on error type
async function provideTroubleshootingGuidance(error: Error): Promise<void> {
  console.group('🔧 TROUBLESHOOTING GUIDANCE');
  
  if (error.message.includes('not found') || error.message.includes('404')) {
    console.error('❌ ISSUE: Service worker file missing');
    console.error('❌ SOLUTION: Run `npx msw init public/` in your project root');
    console.error('❌ EXPLANATION: MSW requires a service worker file to intercept requests');
  }
  
  if (error.message.includes('registration failed') || error.message.includes('register')) {
    console.error('❌ ISSUE: Service worker registration failed');
    console.error('❌ POSSIBLE CAUSES:');
    console.error('   - Not in secure context (HTTPS required in production)');
    console.error('   - Service worker file corrupted or invalid');
    console.error('   - Browser security settings blocking service workers');
    console.error('❌ SOLUTIONS:');
    console.error('   - Ensure you\'re on localhost or HTTPS');
    console.error('   - Re-run `npx msw init public/` to regenerate service worker');
    console.error('   - Check browser developer tools for detailed errors');
  }
  
  if (error.message.includes('timeout')) {
    console.error('❌ ISSUE: MSW startup timeout');
    console.error('❌ POSSIBLE CAUSES:');
    console.error('   - Network issues preventing service worker download');
    console.error('   - Service worker file too large or corrupted');
    console.error('   - Browser performance issues');
    console.error('❌ SOLUTIONS:');
    console.error('   - Check network tab in browser dev tools');
    console.error('   - Try refreshing the page');
    console.error('   - Clear browser cache and service workers');
  }
  
  console.error('❌ GENERAL SOLUTIONS:');
  console.error('   1. Open browser dev tools and check console for detailed errors');
  console.error('   2. Check Application > Service Workers tab');
  console.error('   3. Try clearing all site data and reloading');
  console.error('   4. Ensure no browser extensions are blocking service workers');
  
  console.groupEnd();
}

// Helper to stop mock server
export const stopMockServer = () => {
  if (config.mock.enabled) {
    worker.stop();
    console.log('🎭 Mock API server stopped');
  }
};