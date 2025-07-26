import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startMockServer } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import config from './lib/config';
import './index.css';

// Enhanced MSW Status Component with better UX
function MSWStatus({ status }: { status: 'loading' | 'ready' | 'error' }) {
  if (status === 'ready') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '20px'
      }}>
        {status === 'loading' && (
          <>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>🎭</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1f2937'
            }}>
              Starting Mock Service Worker
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              lineHeight: '1.5'
            }}>
              Setting up API mocking for development...
              <br />
              This usually takes just a few seconds.
            </div>
            <div style={{
              marginTop: '16px',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                animation: 'loading 2s infinite ease-in-out'
              }} />
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px'
            }}>⚠️</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#dc2626'
            }}>
              MSW Initialization Failed
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              The mock API server couldn't start, but the app will continue 
              with fallback data. Check the console for details.
            </div>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#92400e'
            }}>
              App functionality may be limited
            </div>
          </>
        )}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `
      }} />
    </div>
  );
}

// Render React app
function renderApp(mswStatus: 'loading' | 'ready' | 'error' = 'ready') {
  console.log('🚀 Rendering React application with MSW status:', mswStatus);
  ReactDOM.createRoot(
    document.getElementById('root')!
  ).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <MSWStatus status={mswStatus} />
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Enhanced MSW initialization with robust error handling
async function initializeMSW(): Promise<void> {
  console.log('🎭 === MSW INITIALIZATION START ===');
  console.log('🎭 Environment:', import.meta.env.MODE);
  console.log('🎭 Service Worker support:', 'serviceWorker' in navigator);
  console.log('🎭 Current URL:', window.location.href);
  
  // Check service worker support
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported - MSW cannot start');
  }

  // Pre-flight checks
  await performPreflightChecks();
  
  console.log('🎭 Starting MSW with timeout protection...');
  
  // Start MSW with timeout
  const success = await Promise.race([
    startMockServer(),
    new Promise<boolean>((_, reject) => 
      setTimeout(() => reject(new Error('MSW startup timeout after 10 seconds')), 10000)
    )
  ]);
  
  if (!success) {
    throw new Error('MSW failed to start properly');
  }
  
  console.log('✅ MSW started successfully');
  
  // Wait for service worker to be fully ready
  await waitForServiceWorkerReady();
  
  // Verify MSW is working with a test request
  await verifyMSWWorking();
  
  console.log('✅ === MSW INITIALIZATION SUCCESS ===');
}

// Pre-flight checks for MSW requirements
async function performPreflightChecks(): Promise<void> {
  console.log('🎭 Performing pre-flight checks...');
  
  // Check if mockServiceWorker.js is accessible
  try {
    const swResponse = await fetch('/mockServiceWorker.js', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    
    if (!swResponse.ok) {
      console.warn('⚠️ mockServiceWorker.js returned status:', swResponse.status);
      if (swResponse.status === 404) {
        throw new Error('mockServiceWorker.js not found - run `npx msw init public/` to fix');
      }
    }
    console.log('✅ mockServiceWorker.js is accessible');
  } catch (error) {
    console.error('❌ Cannot access mockServiceWorker.js:', error.message);
    throw new Error(`MSW service worker file not accessible: ${error.message}`);
  }
  
  // Check if we're in a secure context (required for service workers)
  if (!window.isSecureContext && location.protocol !== 'http:') {
    console.warn('⚠️ Not in secure context - service workers may not work');
  }
  
  console.log('✅ Pre-flight checks passed');
}

// Wait for service worker to be fully ready
async function waitForServiceWorkerReady(): Promise<void> {
  console.log('🎭 Waiting for service worker to be ready...');
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Service worker ready timeout'));
    }, 5000);
    
    // Check if service worker is already active
    if (navigator.serviceWorker.controller) {
      clearTimeout(timeout);
      console.log('✅ Service worker already active');
      resolve();
      return;
    }
    
    // Listen for service worker to become active
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      clearTimeout(timeout);
      console.log('✅ Service worker became active');
      resolve();
    }, { once: true });
    
    // Fallback - resolve after a short delay even if no controllerchange
    setTimeout(() => {
      clearTimeout(timeout);
      console.log('✅ Service worker ready (fallback)');
      resolve();
    }, 2000);
  });
}

// Enhanced MSW verification with multiple retry attempts
async function verifyMSWWorking(): Promise<void> {
  console.log('🔍 Verifying MSW is working...');
  
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verification attempt ${attempt}/${maxRetries}...`);
      
      // Add cache-busting to ensure fresh request
      const response = await fetch(`/api/mock/health?t=${Date.now()}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        throw new Error('Received HTML instead of JSON - MSW not intercepting');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Verify response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from MSW');
      }
      
      console.log('✅ MSW verification successful:', data);
      return;
      
    } catch (error) {
      lastError = error;
      console.warn(`❌ Verification attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Progressive delay
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`MSW verification failed after ${maxRetries} attempts: ${lastError.message}`);
}

// Enhanced bootstrap with improved MSW handling and user feedback
async function bootstrap() {
  console.log('🚀 === APPLICATION BOOTSTRAP START ===');
  
  // Always show loading initially
  renderApp('loading');
  
  // In development, always try to start MSW
  if (import.meta.env.MODE === 'development') {
    try {
      console.log('🎭 Development mode detected - starting MSW...');
      await initializeMSW();
      console.log('✅ MSW initialization completed');
      
      // Brief delay to show success state
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.warn('⚠️ MSW failed to start:', error.message);
      
      // Show error state briefly before continuing
      renderApp('error');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log detailed troubleshooting information
      console.group('🔧 MSW Troubleshooting Information');
      console.log('Error:', error.message);
      console.log('Environment:', import.meta.env.MODE);
      console.log('URL:', window.location.href);
      console.log('Service Worker Support:', 'serviceWorker' in navigator);
      console.log('Secure Context:', window.isSecureContext);
      console.groupEnd();
    }
  }
  
  // Always render the app regardless of MSW status
  console.log('✅ Rendering React application...');
  renderApp('ready');
  
  console.log('✅ === APPLICATION BOOTSTRAP COMPLETE ===');
}

// Start the application
bootstrap();
