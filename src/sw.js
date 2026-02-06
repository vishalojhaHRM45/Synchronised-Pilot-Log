/// <reference lib="webworker" />
/// <reference types="vite/client" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST || []);
clientsClaim();

self.addEventListener("install", (event) => {
  // console.log(`[SW] Installing...`);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // console.log("[SW] Activating...");
  event.waitUntil(
    self.clients.claim().then(() => console.log("[SW] Claimed all clients"))
  );
});

self.addEventListener("push", (event) => {
  // console.log("[SW] Push notification received");

  if (!event.data) return;

  try {
    const payload = event.data.json();
    // console.log('[SW] Received payload:', payload);

    const title = payload.title || "New Notification";
    const notificationId = payload.notificationId || payload.data?.notificationId;

    const options = {
      body: payload.body || "",
      icon: payload.icon || "/pwa-192x192.png",
      badge: payload.badge || "/pwa-64x64.png",
      data: {
        url: `/notification/${notificationId}`,
        notificationId: notificationId,
        submissionId: payload.submissionId || payload.data?.submissionId,
        rmUserId: payload.rmUserId || payload.data?.rmUserId,
        timestamp: Date.now(),
      },
      vibrate: payload.vibrate || [200, 100, 200],
      tag: payload.tag || "eLogBook-notification",
      renotify: payload.renotify !== false,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      actions: payload.actions || [
        { action: "open", title: "Open" },
        { action: "close", title: "Dismiss" },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    // console.error("[SW] Error parsing push data:", error);
  }
});


self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  if (event.action === "close") {
    // console.log("[SW] User dismissed notification");
    return;
  }

  const notificationData = event.notification.data || {};
  const targetPath = notificationData.url || "/";


  const urlToOpen = new URL(targetPath, self.location.origin).href;

  const promiseChain = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      for (const client of windowClients) {
        // console.log('[SW] Checking client:', client.url);
        try {
          const clientUrl = new URL(client.url);
          const serviceWorkerOrigin = self.location.origin;
          if (clientUrl.origin === serviceWorkerOrigin && "focus" in client) {
            return client.focus().then((focusedClient) => {
              if ('navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
              focusedClient.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: targetPath,
                data: notificationData
              });
              return focusedClient;
            });
          }
        } catch (urlError) {
          // console.warn('[SW] Invalid client URL:', client.url, urlError);
          continue;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      return null;
    }).catch((err) => {
      // console.error("[SW] Error handling notification click:", err);
    });

  event.waitUntil(promiseChain);
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NAVIGATE') {
    // console.log('[SW] Navigation requested to:', event.data.url);
  }
});

console.log('[SW] eLogBook Service Worker loaded! 🚀');