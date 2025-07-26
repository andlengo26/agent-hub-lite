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

// Simplified MSW initialization
async function initializeMSW(): Promise<void> {
  console.log('🎭 === MSW INITIALIZATION START ===');
  
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported');
  }

  console.log('🎭 Starting MSW...');
  const success = await startMockServer();
  
  if (!success) {
    throw new Error('MSW failed to start');
  }
  
  console.log('✅ === MSW INITIALIZATION SUCCESS ===');
}

// Remove the complex verification functions - keep it simple

// Simplified bootstrap function
async function bootstrap() {
  console.log('🚀 === APPLICATION BOOTSTRAP START ===');
  
  // Always show loading initially
  renderApp('loading');
  
  // In development, try to start MSW
  if (import.meta.env.MODE === 'development') {
    try {
      console.log('🎭 Development mode - starting MSW...');
      await initializeMSW();
      console.log('✅ MSW started successfully');
      
      // Brief delay to show success
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.warn('⚠️ MSW failed to start:', error.message);
      console.warn('⚠️ App will continue with fallback data');
      
      // Show error briefly
      renderApp('error');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // Render the app
  console.log('✅ Rendering React application...');
  renderApp('ready');
  
  console.log('✅ === APPLICATION BOOTSTRAP COMPLETE ===');
}

// Start the application
bootstrap();
