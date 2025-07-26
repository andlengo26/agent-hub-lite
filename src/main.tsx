import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeMSW } from "./lib/mock-server";
import { QueryProvider } from "./components/ui/QueryProvider.tsx";

// Enhanced MSW initialization with proper error handling
console.log('🚀 Starting application...');

const initializeApp = async () => {
  // Initialize MSW first
  const mswInitialized = await initializeMSW();
  
  if (mswInitialized) {
    console.log('✅ MSW initialized successfully');
  } else {
    console.log('⚠️ MSW initialization failed - using fallback mode');
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StrictMode>,
  );
};

// Start the application
initializeApp().catch(error => {
  console.error('❌ Failed to initialize application:', error);
  
  // Fallback: render app anyway
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StrictMode>,
  );
});
