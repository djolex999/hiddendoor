import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  build: {
    sourcemap: false,
    // Chunk files get hash-only names: a cached "HelpView-....js" would tell
    // anyone looking at the browser cache that help was opened here.
    rollupOptions: { output: { chunkFileNames: "assets/[hash].js" } },
  },
});
