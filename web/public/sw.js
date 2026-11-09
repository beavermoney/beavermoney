// Retirement worker. Keep this at the old URL for clients whose cached app
// still registers sw.js. No fetch handler: all requests go to the network.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim()
      const names = await caches.keys()
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith('workbox-precache-') ||
              name === 'logo-dev-images',
          )
          .map((name) => caches.delete(name)),
      )
      await self.registration.unregister()
      // Do not force-reload open forms. The next reload uses the network.
    })(),
  )
})
