
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false, // Автоматически найдёт свободный порт
    hmr: {
      overlay: true,
      clientPort: 443
    },
    watch: {
      usePolling: true // Улучшает стабильность в контейнерах
    },
  },
  plugins: [
    react(),
    componentTagger(),
  ].filter(Boolean)
});
