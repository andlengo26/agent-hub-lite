import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startMockServer } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Render React app immediately - don't wait for MSW
function renderApp() {
  console.log('🚀 Rendering React application...');
  ReactDOM.createRoot(
    document.getElementById('root')!
  ).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Start MSW in background without blocking React render
async function initializeMSW() {
  console.log('🎭 Initializing Mock Service Worker in background...');
  
  try {
    // Only start MSW if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('🎭 Service Workers not supported - skipping MSW');
      return;
    }

    const mswStarted = await startMockServer();
    
    if (mswStarted) {
      console.log('✅ MSW initialized successfully');
    } else {
      console.log('⚠️ MSW initialization skipped or failed - app will continue with fallback data');
    }
  } catch (error) {
    console.warn('⚠️ MSW initialization failed:', error.message);
    console.log('🎭 App will continue without MSW - API calls will use fallback behavior');
  }
}

// Bootstrap function: render immediately, start MSW in background
async function bootstrap() {
  console.log('🚀 Starting application bootstrap...');
  
  // Render React app immediately
  renderApp();
  
  // Start MSW in background (non-blocking)
  initializeMSW().catch(error => {
    console.warn('🎭 Background MSW initialization failed:', error);
    // App continues to work normally
  });
  
  console.log('✅ Application bootstrap completed');
}

// Start the application
bootstrap();
