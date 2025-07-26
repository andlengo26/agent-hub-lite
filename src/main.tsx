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

// Comprehensive MSW initialization with detailed diagnostics
async function initializeMSW(): Promise<boolean> {
  console.log('🎭 === MSW INITIALIZATION START ===');
  console.log('🎭 Environment:', import.meta.env.MODE);
  console.log('🎭 Mock enabled:', config.mock.enabled);
  console.log('🎭 Service Worker support:', 'serviceWorker' in navigator);
  console.log('🎭 Current URL:', window.location.href);
  
  // Check if MSW is disabled
  if (!config.mock.enabled) {
    console.log('🎭 MSW disabled in config - skipping initialization');
    return false;
  }

  // Check service worker support
  if (!('serviceWorker' in navigator)) {
    console.warn('🎭 Service Workers not supported - MSW cannot start');
    return false;
  }

  try {
    // Start MSW with comprehensive error handling
    console.log('🎭 Starting MSW with enhanced configuration...');
    
    const success = await startMockServer();
    
    if (success) {
      console.log('✅ === MSW INITIALIZATION SUCCESS ===');
      
      // Verify MSW is working with a test request
      await verifyMSWWorking();
      
      return true;
    } else {
      console.error('❌ MSW failed to start properly');
      return false;
    }
  } catch (error) {
    console.error('❌ === MSW INITIALIZATION ERROR ===');
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Additional diagnostics
    console.error('❌ Troubleshooting info:');
    console.error('   - Current origin:', window.location.origin);
    console.error('   - Service worker URL:', '/mockServiceWorker.js');
    console.error('   - Config mock enabled:', config.mock.enabled);
    
    return false;
  }
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

// Enhanced bootstrap with proper MSW waiting
async function bootstrap() {
  console.log('🚀 === APPLICATION BOOTSTRAP START ===');
  
  try {
    // Show loading status
    renderApp('loading');
    
    // Wait for MSW to be ready (or fail)
    const mswReady = await initializeMSW();
    
    if (mswReady) {
      console.log('✅ MSW ready - rendering app with full functionality');
      renderApp('ready');
    } else {
      console.warn('⚠️ MSW not available - rendering app with fallback behavior');
      renderApp('error');
      
      // Clear error status after a delay
      setTimeout(() => {
        renderApp('ready');
      }, 3000);
    }
    
    console.log('✅ === APPLICATION BOOTSTRAP COMPLETE ===');
    
  } catch (error) {
    console.error('❌ === APPLICATION BOOTSTRAP FAILED ===');
    console.error('❌ Error:', error);
    
    // Render app anyway with error status
    renderApp('error');
    
    // Clear error status after a delay
    setTimeout(() => {
      renderApp('ready');
    }, 3000);
  }
}

// Start the application
bootstrap();
