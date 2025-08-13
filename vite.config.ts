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
      input: {
        // Main pages - these will create separate bundles
        main: path.resolve(__dirname, 'client/entries/index.tsx'),
        bundles: path.resolve(__dirname, 'client/entries/bundles.tsx'),
        contact: path.resolve(__dirname, 'client/entries/contact.tsx'),
        faq: path.resolve(__dirname, 'client/entries/faq.tsx'),
        'custom-order': path.resolve(__dirname, 'client/entries/custom-order.tsx'),
        terms: path.resolve(__dirname, 'client/entries/terms.tsx'),
        privacy: path.resolve(__dirname, 'client/entries/privacy.tsx'),
        login: path.resolve(__dirname, 'client/entries/login.tsx'),
        register: path.resolve(__dirname, 'client/entries/register.tsx'),
        'forgot-password': path.resolve(__dirname, 'client/entries/forgot-password.tsx'),
        'email-confirmation': path.resolve(__dirname, 'client/entries/email-confirmation.tsx'),
        account: path.resolve(__dirname, 'client/entries/account.tsx'),
        cart: path.resolve(__dirname, 'client/entries/cart.tsx'),
        checkout: path.resolve(__dirname, 'client/entries/checkout.tsx'),
        admin: path.resolve(__dirname, 'client/entries/admin.tsx'),
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `chunks/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: (id) => {
          if (id.includes("node_modules/react")) {
            return "vendor-react";
          }
          if (id.includes("@radix-ui")) {
            return "vendor-ui";
          }
          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }
          if (id.includes("@tanstack/react-query")) {
            return "vendor-query";
          }
          if (id.includes("node_modules")) {
            return "vendor-misc";
          }
        },
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
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    expressPlugin(),
    mode === "production" && htmlPlugin(),
    mode === "development" && devMPAPlugin(),
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
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}

// Development MPA plugin - serves correct pages based on URL
function devMPAPlugin(): Plugin {
  return {
    name: "dev-mpa",
    apply: "serve",
    configureServer(server) {
      // No URL rewriting needed - let Vite handle the HTML files directly
      // The HTML files will reference the .tsx files in development
    },
  };
}

// Production HTML generation plugin
function htmlPlugin(): Plugin {
  return {
    name: "html-generator",
    generateBundle() {
      const pages = [
        { name: 'index', title: 'HelldiversBoost - Professional Helldivers 2 Boosting Services' },
        { name: 'bundles', title: 'Bundles - HelldiversBoost' },
        { name: 'contact', title: 'Contact - HelldiversBoost' },
        { name: 'faq', title: 'FAQ - HelldiversBoost' },
        { name: 'custom-order', title: 'Custom Order - HelldiversBoost' },
        { name: 'terms', title: 'Terms of Service - HelldiversBoost' },
        { name: 'privacy', title: 'Privacy Policy - HelldiversBoost' },
        { name: 'login', title: 'Login - HelldiversBoost' },
        { name: 'register', title: 'Register - HelldiversBoost' },
        { name: 'forgot-password', title: 'Forgot Password - HelldiversBoost' },
        { name: 'email-confirmation', title: 'Email Confirmation - HelldiversBoost' },
        { name: 'account', title: 'Account - HelldiversBoost' },
        { name: 'cart', title: 'Shopping Cart - HelldiversBoost' },
        { name: 'checkout', title: 'Checkout - HelldiversBoost' },
        { name: 'admin', title: 'Admin Dashboard - HelldiversBoost' },
      ];

      pages.forEach(page => {
        const entryName = page.name === 'index' ? 'main' : page.name;
        const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/placeholder.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${page.title}</title>
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entryName}.js"></script>
  </body>
</html>`;

        this.emitFile({
          type: 'asset',
          fileName: `${page.name}.html`,
          source: htmlContent
        });
      });
    }
  };
}
