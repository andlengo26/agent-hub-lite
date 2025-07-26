import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Enhanced MSW initialization with verification
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

    // Step 2: Start MSW worker
    await worker.start({
      serviceWorker: {
        url: swUrl,
        options: { scope: '/' },
      },
      onUnhandledRequest: 'warn',
      waitUntilReady: true,
    });

    // Step 3: Verify MSW is working with a test request
    console.log('[MSW] Testing mock server with health check...');
    try {
      const testResponse = await fetch('/health');
      const testData = await testResponse.json();
      
      if (testData.status === 'ok') {
        console.log('[MSW] ✅ Mock server is working correctly');
        console.log('[MSW] Test response:', testData);
        return true;
      } else {
        throw new Error('Health check failed - unexpected response');
      }
    } catch (error) {
      console.error('[MSW] ❌ Mock server test failed:', error);
      throw new Error(`Mock server verification failed: ${error.message}`);
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
