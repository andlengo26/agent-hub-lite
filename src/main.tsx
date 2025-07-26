import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { worker } from "./lib/mock-server";
import { QueryProvider } from "./components/ui/QueryProvider.tsx";
import config from "./lib/config";

const root = createRoot(document.getElementById("root")!);

// Start mock server and wait for it before rendering the app
async function initApp() {
  if (config.mock.enabled) {
    try {
      console.log('🎭 Starting Mock Service Worker...');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      });
      
      // Add debugging listeners
      worker.events.on('request:start', ({ request }) => {
        console.log('🎭 MSW intercepted:', request.method, request.url);
      });
      
      worker.events.on('request:match', ({ request }) => {
        console.log('✅ MSW matched handler for:', request.method, request.url);
      });
      
      worker.events.on('request:unhandled', ({ request }) => {
        console.log('⚠️ MSW unhandled request:', request.method, request.url);
      });
      
      console.log('🎭 Mock Service Worker started successfully');
      console.log('🎭 Available handlers:', worker.listHandlers().length);
    } catch (error) {
      console.error('❌ Failed to start MSW:', error);
      console.log('🎭 Continuing without mock server - will use fallback data');
    }
  }

  // Render the app
  root.render(
    <StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StrictMode>
  );
}

initApp();
