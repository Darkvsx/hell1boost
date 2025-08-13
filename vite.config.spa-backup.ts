import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    sourcemap: mode === "development",
    minify: "terser",
    target: "es2020",
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries - MUST be first and most specific
          if (
            id.includes("node_modules/react/index.js") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("react/jsx-runtime") ||
            id.includes("react-dom/client")
          ) {
            return "vendor-react";
          }
          // Router (after React check)
          if (id.includes("react-router")) {
            return "vendor-router";
          }
          // UI libraries (Radix UI)
          if (id.includes("@radix-ui")) {
            return "vendor-ui";
          }
          // Lucide icons
          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }
          // Supabase
          if (id.includes("@supabase") || id.includes("supabase")) {
            return "vendor-supabase";
          }
          // PayPal
          if (id.includes("@paypal")) {
            return "vendor-paypal";
          }
          // React Query
          if (id.includes("@tanstack/react-query")) {
            return "vendor-query";
          }
          // Framer Motion
          if (id.includes("framer-motion")) {
            return "vendor-animation";
          }
          // Three.js (if used)
          if (id.includes("three") || id.includes("@react-three")) {
            return "vendor-3d";
          }
          // Other vendor libraries (this should be last)
          if (id.includes("node_modules")) {
            return "vendor-misc";
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            const fileName = facadeModuleId
              .split("/")
              .pop()
              ?.replace(".tsx", "")
              .replace(".ts", "");
            return `chunks/${fileName}-[hash].js`;
          }
          return `chunks/[name]-[hash].js`;
        },
        entryFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "lucide-react",
      "@paypal/react-paypal-js",
      "framer-motion",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "zod",
      "date-fns",
      "clsx",
      "tailwind-merge",
    ],
    exclude: [
      // Exclude large libraries that should be lazy loaded
      "@react-three/fiber",
      "@react-three/drei",
    ],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    expressPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
