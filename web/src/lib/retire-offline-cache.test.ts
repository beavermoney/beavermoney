import { afterEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { retireOfflineCache } from './retire-offline-cache'

afterEach(() => vi.unstubAllGlobals())

it('removes only the old app registration and caches, preserving other storage', async () => {
  const unregister = vi.fn().mockResolvedValue(true)
  const unrelated = vi.fn()
  const remove = vi.fn().mockResolvedValue(true)
  vi.stubGlobal('navigator', {
    serviceWorker: {
      getRegistrations: async () => [
        { active: { scriptURL: 'https://beavermoney.app/sw.js' }, unregister },
        {
          active: { scriptURL: 'https://beavermoney.app/other.js' },
          unregister: unrelated,
        },
      ],
    },
  })
  vi.stubGlobal('caches', {
    keys: async () => [
      'workbox-precache-v2-site',
      'logo-dev-images',
      'unrelated-cache',
    ],
    delete: remove,
  })
  await retireOfflineCache()
  expect(unregister).toHaveBeenCalledOnce()
  expect(unrelated).not.toHaveBeenCalled()
  expect(remove.mock.calls).toEqual([
    ['workbox-precache-v2-site'],
    ['logo-dev-images'],
  ])
})

it('replaces the legacy worker without caching requests or reloading open forms', async () => {
  const handlers = new Map<
    string,
    (event: { waitUntil: (task: Promise<void>) => void }) => void
  >()
  const unregister = vi.fn().mockResolvedValue(true)
  const claim = vi.fn().mockResolvedValue(undefined)
  const skipWaiting = vi.fn()
  const remove = vi.fn().mockResolvedValue(true)
  runInNewContext(
    readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8'),
    {
      self: {
        addEventListener: (
          name: string,
          handler: (event: {
            waitUntil: (task: Promise<void>) => void
          }) => void,
        ) => handlers.set(name, handler),
        skipWaiting,
        clients: { claim },
        registration: { unregister },
      },
      caches: {
        keys: async () => [
          'workbox-precache-v2-site',
          'logo-dev-images',
          'unrelated-cache',
        ],
        delete: remove,
      },
    },
  )
  expect([...handlers.keys()]).toEqual(['install', 'activate'])
  handlers.get('install')!({ waitUntil: () => {} })
  expect(skipWaiting).toHaveBeenCalledOnce()
  let activation: Promise<void> | undefined
  handlers.get('activate')!({
    waitUntil: (task) => {
      activation = task
    },
  })
  await activation
  expect(claim).toHaveBeenCalledOnce()
  expect(unregister).toHaveBeenCalledOnce()
  expect(remove.mock.calls).toEqual([
    ['workbox-precache-v2-site'],
    ['logo-dev-images'],
  ])
})
