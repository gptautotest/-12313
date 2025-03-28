
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
    port: 3000,
    strictPort: false, // Разрешаем использовать альтернативный порт если основной занят
    hmr: {
      clientPort: 443,
      host: "0.0.0.0"
    },
    watch: {
      usePolling: true
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false
  },
  plugins: [
    react(),
    componentTagger(),
  ].filter(Boolean)
});
