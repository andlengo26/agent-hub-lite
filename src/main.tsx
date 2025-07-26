import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startMockServer } from "./lib/mock-server";
import { QueryProvider } from "./components/ui/QueryProvider.tsx";

// Initialize the app
async function initializeApp() {
  // Start mock server first in development
  const mockStarted = await startMockServer();
  
  if (mockStarted) {
    console.log('🎭 App initialized with mock server');
  } else {
    console.log('🎭 App initialized without mock server');
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StrictMode>,
  );
}

// Start the application
initializeApp().catch(console.error);
