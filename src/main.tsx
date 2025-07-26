import React from 'react';
import { worker } from './lib/mock-server';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from './components/ui/QueryProvider';
import './index.css';

async function init() {
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    // log the base URL to verify where Vite is hosting your app
    console.log('BASE_URL =', import.meta.env.BASE_URL);

    await worker.start({
      serviceWorker: {
        // ensure the path matches exactly where the file is served
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        options: { scope: '/' },  // <-- register for the entire origin
      },
      onUnhandledRequest: 'warn',
    });

    // confirm registration
    console.log('MSW worker active:', navigator.serviceWorker.controller);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
}

init().catch(err => {
  console.error('Failed to start MSW', err);
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </React.StrictMode>
  );
});
