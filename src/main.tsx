import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import './index.css';

async function bootstrap() {
  // Only in development, start MSW first
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    await worker.start({
      serviceWorker: {
        // ensures Vite serves it at the right URL
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        options: { scope: '/' },
      },
      onUnhandledRequest: 'warn',  // logs any requests that MSW misses
    });
    console.log('[MSW] Service worker ready');
  }
  // Now mount your React app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
}

bootstrap().catch(err => {
  console.error('Failed to start MSW', err);
  // Fallback: still start the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
});
