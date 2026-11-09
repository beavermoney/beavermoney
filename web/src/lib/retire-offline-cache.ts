// Migration only: never register another worker or cache a response. Keep this
// for returning clients that still have the former Workbox app shell installed.
export async function retireOfflineCache() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      registrations
        .filter((registration) => {
          const worker =
            registration.active ??
            registration.waiting ??
            registration.installing
          return worker && new URL(worker.scriptURL).pathname === '/sw.js'
        })
        .map((registration) => registration.unregister()),
    )
  }
  if ('caches' in globalThis) {
    const names = await caches.keys()
    await Promise.all(
      names
        .filter(
          (name) =>
            name.startsWith('workbox-precache-') || name === 'logo-dev-images',
        )
        .map((name) => caches.delete(name)),
    )
  }
}
