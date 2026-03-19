self.__WB_DISABLE_DEV_LOGS = true;
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  // Disable verbose development logs
  workbox.setConfig({ debug: false });

  // Cache static assets (CSS, JS, HTML)
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style' || request.destination === 'document',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Cache product images
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Firestore data (Network First to ensure fresh catalog)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://firestore.googleapis.com',
    new workbox.strategies.NetworkFirst({
      cacheName: 'firestore-data',
    })
  );
}
