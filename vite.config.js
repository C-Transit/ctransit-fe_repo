import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },

  optimizeDeps: {
    // esbuildOptions was removed in Vite 8 (now uses Rolldown).
    // bigint is natively supported in all modern browsers and Node 18+
    // so no explicit flag is needed. Removing this was causing Rolldown
    // to bundle React through a different pipeline than react-dom,
    // producing two React instances at runtime and breaking hooks.
    include: ["react", "react-dom"],
  },
});
