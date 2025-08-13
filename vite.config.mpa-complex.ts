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
        // Main entry point
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
        entryFileNames: (chunkInfo) => {
          return `${chunkInfo.name}.js`;
        },
        chunkFileNames: `chunks/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: (id) => {
          // Core React libraries - shared across all pages
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
    htmlPlugin(),
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

// Plugin to generate HTML files for each entry
function htmlPlugin(): Plugin {
  return {
    name: "html-generator",
    generateBundle() {
      const pages = [
        { name: 'index', title: 'HelldiversBoost - Professional Helldivers 2 Boosting Services', description: 'Get professional Helldivers 2 boosting services from expert players. Fast delivery, secure service, and competitive prices.' },
        { name: 'bundles', title: 'Bundles - HelldiversBoost', description: 'Browse our premium Helldivers 2 boost bundles for the best value and fastest progression.' },
        { name: 'contact', title: 'Contact - HelldiversBoost', description: 'Get in touch with our Helldivers 2 boost support team for any questions or assistance.' },
        { name: 'faq', title: 'FAQ - HelldiversBoost', description: 'Frequently asked questions about our Helldivers 2 boosting services, delivery times, and support.' },
        { name: 'custom-order', title: 'Custom Order - HelldiversBoost', description: 'Create a custom Helldivers 2 boost order tailored to your specific needs and requirements.' },
        { name: 'terms', title: 'Terms of Service - HelldiversBoost', description: 'Read our terms of service and conditions for using HelldiversBoost gaming services.' },
        { name: 'privacy', title: 'Privacy Policy - HelldiversBoost', description: 'Our privacy policy explains how we collect, use, and protect your personal information.' },
        { name: 'login', title: 'Login - HelldiversBoost', description: 'Sign in to your HelldiversBoost account to access your orders and account settings.' },
        { name: 'register', title: 'Register - HelldiversBoost', description: 'Create your HelldiversBoost account to start ordering professional Helldivers 2 boosting services.' },
        { name: 'forgot-password', title: 'Forgot Password - HelldiversBoost', description: 'Reset your HelldiversBoost account password to regain access to your account.' },
        { name: 'email-confirmation', title: 'Email Confirmation - HelldiversBoost', description: 'Confirm your email address to complete your HelldiversBoost account setup.' },
        { name: 'account', title: 'Account - HelldiversBoost', description: 'Manage your HelldiversBoost account settings, order history, and profile information.' },
        { name: 'cart', title: 'Shopping Cart - HelldiversBoost', description: 'Review your selected Helldivers 2 boost services before checkout.' },
        { name: 'checkout', title: 'Checkout - HelldiversBoost', description: 'Complete your Helldivers 2 boost service purchase securely and safely.' },
        { name: 'admin', title: 'Admin Dashboard - HelldiversBoost', description: 'Administrative dashboard for managing HelldiversBoost services and users.' },
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
    <meta name="description" content="${page.description}" />
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
