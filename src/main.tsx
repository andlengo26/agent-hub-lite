import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Simple MSW Status Component
function MSWStatus({ status }: { status: 'loading' | 'ready' | 'error' }) {
  if (status === 'ready') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      backgroundColor: status === 'error' ? '#fee2e2' : '#dbeafe',
      color: status === 'error' ? '#dc2626' : '#2563eb',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      {status === 'loading' ? '🎭 Starting MSW...' : '⚠️ MSW Failed'}
    </div>
  );
}

// Minimal initialization - exactly as you specified
async function bootstrap() {
  console.info('🚀 === APPLICATION BOOTSTRAP START ===');
  
  let mswStatus: 'loading' | 'ready' | 'error' = 'ready';
  
  // In development, start MSW first
  if (import.meta.env.MODE === 'development') {
    mswStatus = 'loading';
    
    try {
      console.info('🎭 Starting MSW...');
      await worker.start({
        serviceWorker: {
          url: '/mockServiceWorker.js'
        },
        onUnhandledRequest: 'warn'
      });
      
      console.info('✅ MSW started successfully');
      mswStatus = 'ready';
      
    } catch (error) {
      console.error('❌ MSW failed to start:', error);
      mswStatus = 'error';
    }
  }
  
  // Render the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <MSWStatus status={mswStatus} />
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.info('✅ === APPLICATION BOOTSTRAP COMPLETE ===');
}

// Start the application
bootstrap();
