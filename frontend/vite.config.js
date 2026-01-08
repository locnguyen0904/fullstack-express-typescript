// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.(js|ts|jsx|tsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
      },
      "/media": {
        target: "http://backend:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
  },
});
