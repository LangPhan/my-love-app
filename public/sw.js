/**
 * Service Worker for Love App PWA
 * 
 * Handles:
 * - Offline caching (handled by next-pwa / Workbox)
 * - Push notifications
 * - Background sync
 * - Periodic sync (future feature)
 * 
 * Note: The actual caching strategy is managed by @ducanh2912/next-pwa
 * This file primarily handles push notifications and custom logic
 */

// Service Worker version - increment to force update
const VERSION = "1.0.0";

// Listen for push notifications
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  // Parse notification data
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "Love App",
      body: event.data.text(),
    };
  }

  const {
    title = "Love App",
    body = "You have a new notification",
    icon = "/icons/android/android-launchericon-192-192.png",
    badge = "/icons/android/android-launchericon-96-96.png",
    data: notificationData = {},
  } = data;

  // Show notification
  const options = {
    body,
    icon,
    badge,
    data: notificationData,
    vibrate: [200, 100, 200], // Vibration pattern
    tag: notificationData.tag || "general",
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Get the URL to open (default to home page)
  const urlToOpen = event.notification.data?.url || "/";

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag);
  // Track notification dismissal if needed
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  } else if (event.tag === "sync-todos") {
    event.waitUntil(syncTodos());
  }
});

/**
 * Sync messages when back online
 */
async function syncMessages() {
  try {
    // TODO: Implement message sync logic
    // Fetch queued messages from IndexedDB and send to server
    console.log("Syncing messages...");
    return Promise.resolve();
  } catch (error) {
    console.error("Error syncing messages:", error);
    throw error;
  }
}

/**
 * Sync todos when back online
 */
async function syncTodos() {
  try {
    // TODO: Implement todo sync logic
    // Fetch queued todos from IndexedDB and send to server
    console.log("Syncing todos...");
    return Promise.resolve();
  } catch (error) {
    console.error("Error syncing todos:", error);
    throw error;
  }
}

// Service worker installation
self.addEventListener("install", (event) => {
  console.log(`Service Worker ${VERSION} installing...`);
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Service worker activation
self.addEventListener("activate", (event) => {
  console.log(`Service Worker ${VERSION} activated`);
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log(`Service Worker ${VERSION} loaded`);
