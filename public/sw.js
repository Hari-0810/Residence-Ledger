/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = "avaasa-ledger-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell and critical assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event with robust Cache-First & Network Fallback/Revalidate Strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass API calls to let network run first, but fallback to indexedCache/offline logic
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          // If response is valid, clone and save a copy in database cache
          if (response.status === 200) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: check cache
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return informative mock response when API is unreachableoffline
            return new Response(
              JSON.stringify({
                error: "You are currently offline. Displaying previously cached historical records.",
                isOffline: true
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Non-API calls: standard asset caches
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background to update core files
        fetch(req).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {/* Ignore background client offline errors */});
        
        return cachedResponse;
      }
      return fetch(req);
    })
  );
});

// Push Notifications Event Link
self.addEventListener("push", (event) => {
  let data = { title: "Avaasa Ledger", body: "New financial updates recorded in your society." };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: "Avaasa Ledger", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/manifest.json", // Falls back to standard launcher
    badge: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='4' fill='%230F172A'/></svg>",
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Background Sync Task Scaffolding
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-new-transactions") {
    console.log("[Service Worker] Syncing pending transactions to server...");
    // Future expansion for background uploading can execute here
  }
});
