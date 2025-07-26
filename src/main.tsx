import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import './index.css';

async function start() {
  console.log('🎭 Starting application...');
  
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    console.log('🎭 Development mode with ServiceWorker support detected');
    try {
      await worker.start({
        serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
        onUnhandledRequest: 'warn',
        waitUntilReady: true
      });
      console.log('🎭 MSW started successfully');
    } catch (error) {
      console.error('❌ MSW failed to start:', error);
    }
  } else {
    console.log('🎭 Production mode or no ServiceWorker support');
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
}

start().catch(err => {
  console.error('❌ Application failed to start:', err);
  // Fallback: still render
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
});
