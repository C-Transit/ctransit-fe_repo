import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // historyApiFallback is a webpack-dev-server option — not valid in Vite.
    // Vite handles SPA fallback automatically in dev; for production,
    // vercel.json rewrites handle this.
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
