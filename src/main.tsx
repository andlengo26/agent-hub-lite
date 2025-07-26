import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import './index.css';

// Only in development
if (import.meta.env.DEV) {
  worker
    .start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      onUnhandledRequest: 'warn',
    })
    .then(() => {
      console.log('🎭 MSW started successfully, mounting React app');
      ReactDOM.createRoot(
        document.getElementById('root')!
      ).render(
        <React.StrictMode>
          <QueryProvider>
            <App />
          </QueryProvider>
        </React.StrictMode>
      );
    })
    .catch((err) => {
      console.error('❌ MSW failed to start', err);
      // Fallback: still render your app so you can see error UI
      ReactDOM.createRoot(
        document.getElementById('root')!
      ).render(
        <React.StrictMode>
          <QueryProvider>
            <App />
          </QueryProvider>
        </React.StrictMode>
      );
    });
} else {
  // In production just mount the app normally
  ReactDOM.createRoot(
    document.getElementById('root')!
  ).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
}
