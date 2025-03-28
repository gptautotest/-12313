
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
    host: "0.0.0.0",  // Используем 0.0.0.0 вместо :: для широкой совместимости
    port: 8080,
  },
  plugins: [
    react(),
    componentTagger(),
  ].filter(Boolean)
});
