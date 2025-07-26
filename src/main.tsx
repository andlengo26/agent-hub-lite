import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './lib/mock-server';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

async function bootstrap() {
  // ALWAYS start the mock worker, even in lovable.dev preview
  if ('serviceWorker' in navigator) {
    await worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        options: { scope: '/' },
      },
      onUnhandledRequest: 'warn',
    });
    console.log('[MSW] Worker registered');
  }

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

bootstrap().catch(err => {
  console.error('MSW start failed', err);
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
});
