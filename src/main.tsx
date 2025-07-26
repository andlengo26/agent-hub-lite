import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryProvider } from "./components/ui/QueryProvider.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { logger } from "./lib/logger";

// Initialize app after MSW is ready
async function enableMocking() {
  if (import.meta.env.MODE === 'development') {
    try {
      const { startMockServer } = await import('./lib/mock-server');
      await startMockServer();
      logger.debug('Mock server started successfully');
    } catch (error) {
      logger.error('Failed to start mock server', error);
      // Continue app initialization even if mock server fails
    }
  }
}

// Initialize app with proper error handling
async function initializeApp() {
  try {
    await enableMocking();
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <QueryProvider>
            <App />
          </QueryProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
    
    logger.debug('App initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize app', error);
    
    // Fallback rendering for critical failures
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem;">
          <div style="text-align: center;">
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Failed to Load</h1>
            <p style="margin-bottom: 1rem;">Please refresh the page or contact support.</p>
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
              Reload Page
            </button>
          </div>
        </div>
      `;
    }
  }
}

initializeApp();
