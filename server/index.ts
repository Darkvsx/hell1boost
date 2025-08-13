import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { handleSendEmail } from "./routes/email";

export function createServer() {
  const app = express();

  // Security middleware - relaxed for development
  app.use(
    cors({
      origin: true, // Allow all origins in development
      credentials: true,
    }),
  );

  // Security headers - relaxed for development preview
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Changed from DENY to SAMEORIGIN for preview
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
      ); // Relaxed CSP
    }
    next();
  });

  // Body parsing with size limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Basic rate limiting for email endpoint
  const emailRequests = new Map();
  app.use("/api/send-email", (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5; // max 5 emails per 15 minutes per IP

    if (!emailRequests.has(ip)) {
      emailRequests.set(ip, []);
    }

    const requests = emailRequests
      .get(ip)
      .filter((time: number) => now - time < windowMs);

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many email requests. Please try again later.",
      });
    }

    requests.push(now);
    emailRequests.set(ip, requests);
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Email routes
  app.post("/api/send-email", handleSendEmail);

  // MPA routing for both development and production
  const routes = [
    { path: "/bundles", file: "bundles.html" },
    { path: "/contact", file: "contact.html" },
    { path: "/faq", file: "faq.html" },
    { path: "/custom-order", file: "custom-order.html" },
    { path: "/terms", file: "terms.html" },
    { path: "/privacy", file: "privacy.html" },
    { path: "/login", file: "login.html" },
    { path: "/register", file: "register.html" },
    { path: "/forgot-password", file: "forgot-password.html" },
    { path: "/email-confirmation", file: "email-confirmation.html" },
    { path: "/account", file: "account.html" },
    { path: "/cart", file: "cart.html" },
    { path: "/checkout", file: "checkout.html" },
    { path: "/admin", file: "admin.html" },
  ];

  // Serve static files from appropriate directory
  if (process.env.NODE_ENV === "production") {
    const spaDir = path.resolve("dist/spa");
    app.use(express.static(spaDir));

    // Production: serve built HTML files
    routes.forEach(route => {
      app.get(route.path, (req, res) => {
        const htmlFile = path.join(spaDir, route.file);
        res.sendFile(htmlFile);
      });
    });

    // Home page
    app.get("/", (req, res) => {
      res.sendFile(path.join(spaDir, "index.html"));
    });
  } else {
    // Development: serve HTML files from root directory
    routes.forEach(route => {
      app.get(route.path, (req, res) => {
        const htmlFile = path.resolve(route.file);
        res.sendFile(htmlFile);
      });
    });
  }

  // Default fallback for unknown routes (except API)
  app.get("*", (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    // Serve home page for unknown routes
    if (process.env.NODE_ENV === "production") {
      const spaDir = path.resolve("dist/spa");
      res.sendFile(path.join(spaDir, "index.html"));
    } else {
      res.sendFile(path.resolve("index.html"));
    }
  });

  return app;
}
