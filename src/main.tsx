import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Enhanced MSW initialization with proper timing and readiness detection
async function initializeMSW(): Promise<boolean> {
  if (!import.meta.env.DEV || !('serviceWorker' in navigator)) {
    console.log('[MSW] Skipping MSW setup - not in development or service workers not supported');
    return false;
  }

  try {
    console.log('[MSW] Initializing Mock Service Worker...');
    
    // Step 1: Verify service worker file exists
    const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`;
    console.log('[MSW] Checking service worker file at:', swUrl);
    
    try {
      const swResponse = await fetch(swUrl, { method: 'HEAD' });
      if (!swResponse.ok) {
        throw new Error(`Service worker file not found (${swResponse.status})`);
      }
      console.log('[MSW] Service worker file verified');
    } catch (error) {
      console.error('[MSW] Service worker file check failed:', error);
      throw new Error(`Cannot access service worker file: ${error.message}`);
    }

    // Step 2: Start MSW worker with recommended configuration
    console.log('[MSW] Starting MSW worker...');
    await worker.start({
      serviceWorker: {
        url: swUrl,
        options: { scope: '/' },
      },
      onUnhandledRequest: 'warn',
      // Removed waitUntilReady as it's deprecated
    });

    // Step 3: Wait for service worker to be ready using proper detection
    console.log('[MSW] Waiting for service worker to be ready...');
    await waitForMSWReady();

    // Step 4: Verify MSW is intercepting requests with retries
    console.log('[MSW] Verifying MSW is intercepting requests...');
    const isWorking = await verifyMSWInterception();
    
    if (isWorking) {
      console.log('[MSW] ✅ Mock server is working correctly');
      return true;
    } else {
      throw new Error('MSW verification failed - not intercepting requests');
    }

  } catch (error) {
    console.error('[MSW] ❌ Failed to initialize MSW:', error);
    console.error('[MSW] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Check if it's a service worker registration issue
    if (error.message.includes('register')) {
      console.error('[MSW] This appears to be a service worker registration issue.');
      console.error('[MSW] Make sure the mockServiceWorker.js file is in the public directory.');
    }
    
    return false;
  }
}

// Wait for service worker to be ready using recommended approach
async function waitForMSWReady(): Promise<void> {
  return new Promise((resolve) => {
    // Use a combination of service worker registration check and time-based fallback
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.active) {
            console.log('[MSW] Service worker is active and ready');
            resolve();
            return;
          }
        } catch (error) {
          console.warn('[MSW] Error checking service worker registration:', error);
        }
      }
      
      // Fallback: wait a bit more and try again
      setTimeout(checkServiceWorker, 100);
    };

    // Start checking immediately
    checkServiceWorker();
    
    // Safety timeout - resolve after 3 seconds regardless
    setTimeout(() => {
      console.log('[MSW] Proceeding after timeout - service worker should be ready');
      resolve();
    }, 3000);
  });
}

// Verify MSW is actually intercepting requests with multiple attempts
async function verifyMSWInterception(): Promise<boolean> {
  const maxAttempts = 5;
  const delayBetweenAttempts = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[MSW] Health check attempt ${attempt}/${maxAttempts}`);
      
      // Add cache busting to ensure fresh request
      const response = await fetch(`/health?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`[MSW] Health check response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      // Check if response is JSON (indicating MSW intercepion)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`[MSW] Health check data:`, data);
        
        if (data.status === 'ok') {
          console.log(`[MSW] ✅ Health check successful on attempt ${attempt}`);
          return true;
        }
      } else {
        console.warn(`[MSW] ⚠️ Health check returned non-JSON content-type: ${contentType}`);
        console.warn(`[MSW] This suggests MSW is not intercepting the request`);
      }
      
    } catch (error) {
      console.warn(`[MSW] Health check attempt ${attempt} failed:`, error);
    }
    
    // Wait before next attempt (except for last attempt)
    if (attempt < maxAttempts) {
      console.log(`[MSW] Waiting ${delayBetweenAttempts}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
    }
  }
  
  console.error(`[MSW] ❌ All ${maxAttempts} health check attempts failed`);
  return false;
}

// Bootstrap application with enhanced error handling
async function bootstrap() {
  console.log('[Bootstrap] Starting application initialization...');
  
  // Initialize MSW first in development
  let mswReady = false;
  if (import.meta.env.DEV) {
    mswReady = await initializeMSW();
    
    if (!mswReady) {
      console.warn('[Bootstrap] ⚠️ MSW initialization failed - continuing with fallback data');
      console.warn('[Bootstrap] API calls may fail or return unexpected responses');
    }
  }

  // Mount React app with error boundary
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('[Bootstrap] Mounting React application...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('[Bootstrap] ✅ Application mounted successfully');
  console.log('[Bootstrap] MSW Status:', mswReady ? 'Active' : 'Disabled');
}

// Start the application
bootstrap().catch(error => {
  console.error('[Bootstrap] ❌ Critical error during app initialization:', error);
  
  // Emergency fallback - mount app without MSW
  console.error('[Bootstrap] Attempting emergency fallback...');
  try {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <ErrorBoundary>
            <QueryProvider>
              <App />
            </QueryProvider>
          </ErrorBoundary>
        </React.StrictMode>
      );
      console.log('[Bootstrap] Emergency fallback successful');
    } else {
      document.body.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h1>Application Error</h1>
          <p>Failed to initialize the application. Please refresh the page.</p>
          <details style="margin-top: 20px; text-align: left;">
            <summary>Error Details</summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.message}\n\n${error.stack}</pre>
          </details>
        </div>
      `;
    }
  } catch (fallbackError) {
    console.error('[Bootstrap] ❌ Emergency fallback also failed:', fallbackError);
    document.body.innerHTML = '<h1>Critical Error - Please refresh the page</h1>';
  }
});
