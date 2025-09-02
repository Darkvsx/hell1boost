// Service Worker for HelldiversBoost - Optimized for MPA performance
const CACHE_NAME = "helldivers-boost-v1";
const STATIC_CACHE_NAME = "helldivers-boost-static-v1";
const API_CACHE_NAME = "helldivers-boost-api-v1";

// Resources to cache immediately
const STATIC_ASSETS = [
  "/",
  "/bundles",
  "/unified-checkout",
  "/account",
  "/manifest.json",
];

// API endpoints to cache
const API_ENDPOINTS = ["/api/ping", "/api/demo"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker");

  event.waitUntil((async () => {
    console.log("[SW] Pre-caching static assets safely");
    const staticCache = await caches.open(STATIC_CACHE_NAME);
    await caches.open(API_CACHE_NAME);
    await Promise.all(
      STATIC_ASSETS.map(async (url) => {
        try {
          const resp = await fetch(url, { cache: "no-store" });
          if (resp.ok) {
            await staticCache.put(url, resp.clone());
          } else {
            console.warn("[SW] Skipping asset (non-OK):", url, resp.status);
          }
        } catch (e) {
          console.warn("[SW] Skipping asset (fetch failed):", url, e);
        }
      }),
    );
  })());

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith("/api/")) {
    // API requests - Network first with cache fallback
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
  } else if (url.pathname.startsWith("/_next/static/")) {
    // Next.js static assets - Cache first (immutable)
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    // Static pages - Stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE_NAME));
  } else if (url.origin === location.origin) {
    // Other same-origin requests - Network first
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
  }
});

// Network first strategy - Good for API calls
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache for:", request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return (
        caches.match("/offline") ||
        new Response("Offline - Please check your connection", {
          status: 503,
          statusText: "Service Unavailable",
        })
      );
    }

    throw error;
  }
}

// Cache first strategy - Good for immutable assets
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Cache first failed for:", request.url);
    throw error;
  }
}

// Stale while revalidate - Good for pages that change occasionally
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to fetch in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, return cached version if available
      return cachedResponse;
    });

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for form submissions (if needed)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-order-sync") {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Implement background sync for orders when connection is restored
  console.log("[SW] Background sync triggered for orders");
}

// Push notifications (future feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
