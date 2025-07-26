import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startMockServer } from "./lib/mock-server";
import { QueryProvider } from "./components/ui/QueryProvider.tsx";

// Initialize app after MSW is ready
async function enableMocking() {
  if (import.meta.env.MODE === 'development') {
    const { startMockServer } = await import('./lib/mock-server');
    await startMockServer();
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StrictMode>,
  );
});
