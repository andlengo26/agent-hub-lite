import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from './components/ui/QueryProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Static Mock Status Component (for development)
function MockStatus() {
  if (!import.meta.env.DEV) return null;
  
  return (
    <div className="fixed top-2 right-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs z-50 font-mono">
      📁 Static Mocks Active
    </div>
  );
}

// Render React app
function renderApp() {
  ReactDOM.createRoot(
    document.getElementById('root')!
  ).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <MockStatus />
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

// Verify static mocks are available
async function verifyStaticMocks(): Promise<boolean> {
  try {
    const response = await fetch('/mocks/health.json');
    
    if (response.ok) {
      const data = await response.json();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}


// Simplified bootstrap for static mock system
async function bootstrap() {
  try {
    // In development, verify static mocks are available
    if (import.meta.env.DEV) {
      await verifyStaticMocks();
    }
    
    // Render the app
    renderApp();
    
  } catch (error) {
    // Render app anyway
    renderApp();
  }
}

// Start the application
bootstrap();
