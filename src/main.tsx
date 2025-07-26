import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startMockServer } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import config from './lib/config';
import './index.css';

// MSW Status Component
function MSWStatus({ status }: { status: 'loading' | 'ready' | 'error' }) {
  if (status === 'ready') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      textAlign: 'center'
    }}>
      {status === 'loading' && (
        <>
          <div style={{ marginBottom: '10px' }}>🎭</div>
          <div>Starting Mock Service Worker...</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            This ensures proper API mocking in development
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ marginBottom: '10px' }}>⚠️</div>
          <div>MSW Failed to Start</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            App will continue with fallback data
          </div>
        </>
      )}
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

// Simplified MSW initialization focused on reliability
async function initializeMSW(): Promise<void> {
  console.log('🎭 === MSW INITIALIZATION START ===');
  console.log('🎭 Environment:', import.meta.env.MODE);
  console.log('🎭 Service Worker support:', 'serviceWorker' in navigator);
  console.log('🎭 Current URL:', window.location.href);
  
  // Always check service worker support first
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported - MSW cannot start');
  }

  // Start MSW unconditionally in development
  console.log('🎭 Starting MSW...');
  const success = await startMockServer();
  
  if (!success) {
    throw new Error('MSW failed to start properly');
  }
  
  console.log('✅ MSW started successfully');
  
  // Verify MSW is working with a test request
  await verifyMSWWorking();
  
  console.log('✅ === MSW INITIALIZATION SUCCESS ===');
}

// Verify MSW is properly intercepting requests
async function verifyMSWWorking(): Promise<void> {
  try {
    console.log('🔍 Verifying MSW is working...');
    
    const response = await fetch('/api/mock/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      throw new Error('MSW verification failed - received HTML instead of JSON');
    }
    
    const data = await response.json();
    console.log('✅ MSW verification successful:', data);
    
  } catch (error) {
    console.error('❌ MSW verification failed:', error.message);
    throw new Error(`MSW is not intercepting requests properly: ${error.message}`);
  }
}

// Simplified bootstrap that always starts MSW in development
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
    } catch (error) {
      console.warn('⚠️ MSW failed to start, continuing without it:', error.message);
    }
  }
  
  // Always render the app regardless of MSW status
  console.log('✅ Rendering React application...');
  renderApp('ready');
  
  console.log('✅ === APPLICATION BOOTSTRAP COMPLETE ===');
}

// Start the application
bootstrap();
