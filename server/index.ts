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

  // MPA routes that should serve specific HTML files
  const mpaRoutes = [
    "/bundles",
    "/contact",
    "/faq",
    "/custom-order",
    "/terms",
    "/privacy",
    "/login",
    "/register",
    "/forgot-password",
    "/email-confirmation",
    "/account",
    "/cart",
    "/checkout",
    "/admin",
  ];

  if (process.env.NODE_ENV === "production") {
    const spaDir = path.resolve("dist/spa");
    app.use(express.static(spaDir));
    // Also serve public files
    app.use(express.static(path.resolve("public")));

    // Production: serve specific HTML files for each route
    mpaRoutes.forEach((route) => {
      const routeName = route.substring(1); // Remove leading slash
      app.get(route, (req, res) => {
        const htmlFile = path.join(spaDir, `${routeName}.html`);
        res.sendFile(htmlFile);
      });
    });

    // Home page in production
    app.get("/", (req, res) => {
      res.sendFile(path.join(spaDir, "index.html"));
    });

    // Fallback for production
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(spaDir, "index.html"));
    });
  } else {
    // Development: serve specific HTML files for each route (same as production)
    console.log(`🔧 Setting up development MPA routes for: ${mpaRoutes.join(', ')}`);

    mpaRoutes.forEach((route) => {
      const routeName = route.substring(1); // Remove leading slash
      const htmlFile = `${routeName}.html`;

      app.get(route, (req, res) => {
        console.log(`📄 Serving ${htmlFile} for MPA route: ${route}`);
        res.sendFile(path.resolve(htmlFile));
      });
    });

    // Home page in development
    app.get("/", (req, res) => {
      console.log("🏠 Serving index.html for home page");
      res.sendFile(path.resolve("index.html"));
    });

    // Fallback for development
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        console.log(`❌ API endpoint not found: ${req.path}`);
        return res.status(404).json({ error: "API endpoint not found" });
      }
      console.log(`🔄 Fallback: serving index.html for: ${req.path}`);
      res.sendFile(path.resolve("index.html"));
    });
  }

  return app;
}
