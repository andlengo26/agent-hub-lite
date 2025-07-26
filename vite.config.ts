import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Ensure proper MIME types for service workers
    fs: {
      // Allow serving files from one level up to access MSW files
      allow: ['..']
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Enhanced MSW support configuration
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['msw'],
  },
  // Configure service worker handling
  define: {
    // Ensure MSW can access these values
    __MSW_ENABLED__: mode === 'development',
  },
  // Handle service worker files properly
  build: {
    rollupOptions: {
      output: {
        // Ensure service worker files maintain their names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'mockServiceWorker.js') {
            return 'mockServiceWorker.js';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
}));
