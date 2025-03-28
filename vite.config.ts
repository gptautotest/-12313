import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'buffer': 'buffer',
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    componentTagger(),
  ].filter(Boolean),
}));