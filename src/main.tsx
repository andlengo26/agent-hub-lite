import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startMockServer } from "./lib/mock-server";
import { QueryProvider } from "./components/ui/QueryProvider.tsx";

// Start mock server in development
startMockServer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);
