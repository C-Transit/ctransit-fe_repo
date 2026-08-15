/* eslint-env node */
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGET_ENTRIES = {
  web: {
    name: "web",
    main: path.resolve(__dirname, "src/apps/web/main.jsx"),
    app: path.resolve(__dirname, "src/apps/web/App.jsx"),
    htmlScript: "/src/apps/web/main.jsx",
    title: "C-Transit | Campus Transit",
  },
  admin: {
    name: "admin",
    main: path.resolve(__dirname, "src/apps/admin/main.jsx"),
    app: path.resolve(__dirname, "src/apps/admin/App.jsx"),
    htmlScript: "/src/apps/admin/main.jsx",
    title: "C-Transit Admin Portal",
  },
  agent: {
    name: "agent",
    main: path.resolve(__dirname, "src/apps/agent/main.jsx"),
    app: path.resolve(__dirname, "src/apps/agent/App.jsx"),
    htmlScript: "/src/apps/agent/main.jsx",
    title: "C-Transit Agent & Driver Portal",
  },
};

function appTargetPlugin(targetConfig) {
  return {
    name: "vite-plugin-app-target-entry",
    enforce: "pre",
    transformIndexHtml(html) {
      return html
        .replace(/<title>(.*?)<\/title>/i, `<title>${targetConfig.title}</title>`)
        .replace(/\/src\/main\.jsx/g, targetConfig.htmlScript);
    },
    resolveId(id) {
      if (id === "/src/main.jsx" || id === "./src/main.jsx" || id.endsWith("/src/main.jsx")) {
        return targetConfig.main;
      }
      if (id === "/src/App.jsx" || id === "./src/App.jsx" || id.endsWith("/src/App.jsx")) {
        return targetConfig.app;
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawTarget = (
    process.env.VITE_APP_TARGET ||
    env.VITE_APP_TARGET ||
    process.env.APP_TARGET ||
    mode ||
    "web"
  )
    .toLowerCase()
    .trim();

  const appTarget = ["admin", "agent", "web"].includes(rawTarget) ? rawTarget : "web";
  const targetConfig = TARGET_ENTRIES[appTarget];

  return {
    plugins: [appTargetPlugin(targetConfig), react()],

    resolve: {
      dedupe: ["react", "react-dom"],
      alias: [
        { find: "/src/main.jsx", replacement: targetConfig.main },
        { find: "/src/App.jsx", replacement: targetConfig.app },
        { find: "@app-main", replacement: targetConfig.main },
        { find: "@app-root", replacement: targetConfig.app },
      ],
    },

    define: {
      "import.meta.env.VITE_APP_TARGET": JSON.stringify(appTarget),
    },

    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
    },
  };
});



