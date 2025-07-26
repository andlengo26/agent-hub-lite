import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import './index.css';

function mountApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
}

// Only in development
if (import.meta.env.DEV) {
  console.log('🎭 Development mode detected, starting MSW...');
  worker
    .start({ 
      serviceWorker: { url: '/mockServiceWorker.js' }, 
      onUnhandledRequest: 'warn',
      waitUntilReady: true
    })
    .then(() => {
      console.log('🎭 MSW started successfully, mounting React app');
      mountApp();
    })
    .catch((err) => {
      console.error('❌ MSW failed to start:', err);
      console.log('🎭 Mounting app anyway with fallback data');
      mountApp(); // still render, but mocks are offline
    });
} else {
  console.log('🎭 Production mode, mounting app normally');
  mountApp();
}
