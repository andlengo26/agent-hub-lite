import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Static Mock Status Component (for development)
function MockStatus() {
  if (!import.meta.env.DEV) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#0066cc',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      📁 Static Mocks Active
    </div>
  );
}

// Render React app
function renderApp() {
  console.log('🚀 Rendering React application with static mocks');
  ReactDOM.createRoot(
    document.getElementById('root')!
  ).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <MockStatus />
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Verify static mocks are available
async function verifyStaticMocks(): Promise<boolean> {
  try {
    console.log('📁 Verifying static mocks are available...');
    
    const response = await fetch('/mocks/health.json');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Static mocks verified:', data);
      return true;
    } else {
      console.warn('⚠️ Static mock health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Static mock verification failed:', error);
    return false;
  }
}


// Simplified bootstrap for static mock system
async function bootstrap() {
  console.log('🚀 === APPLICATION BOOTSTRAP START ===');
  
  try {
    // In development, verify static mocks are available
    if (import.meta.env.DEV) {
      const staticMocksWorking = await verifyStaticMocks();
      if (!staticMocksWorking) {
        console.warn('⚠️ Static mocks verification failed, but continuing anyway');
      }
    }
    
    // Render the app
    renderApp();
    
    console.log('✅ === APPLICATION BOOTSTRAP COMPLETE ===');
    
  } catch (error) {
    console.error('❌ === APPLICATION BOOTSTRAP FAILED ===');
    console.error('❌ Error:', error);
    
    // Render app anyway
    renderApp();
  }
}

// Start the application
bootstrap();
