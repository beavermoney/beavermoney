// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { startApplication } from './start-application'

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML =
    '<style id="app-startup-style"></style><section id="app-startup"><p id="app-startup-status">Loading…</p><section id="app-startup-retry" hidden><button><span class="astryx-text">Reload</span></button></section></section><div id="app"></div>'
})
afterEach(() => vi.restoreAllMocks())

it('keeps the HTML loading screen until React commits, not just until JS downloads', async () => {
  let commit: (() => void) | undefined
  let ready:
    ((module: { mountApp: (callback: () => void) => void }) => void) | undefined
  const task = startApplication(
    () =>
      new Promise((resolve) => {
        ready = resolve
      }),
  )
  expect(document.getElementById('app-startup')).not.toBeNull()
  ready!({
    mountApp: (callback) => {
      commit = callback
    },
  })
  await task
  expect(document.getElementById('app-startup')).not.toBeNull()
  commit!()
  expect(document.getElementById('app-startup')).toBeNull()
  expect(document.getElementById('app-startup-style')).toBeNull()
  expect(document.getElementById('app')).not.toBeNull()
})

it('shows a reload action when application loading fails', async () => {
  await startApplication(() => Promise.reject(new Error('offline')))
  expect(document.getElementById('app-startup-status')?.textContent).toContain(
    'Could not load',
  )
  const retry = document.getElementById('app-startup-retry')!
  expect(retry.hidden).toBe(false)
  expect(typeof retry.querySelector('button')?.onclick).toBe('function')
  expect(
    document.getElementById('app-startup')?.hasAttribute('data-failed'),
  ).toBe(true)
})

it('uses the saved language and appearance before the application loads', async () => {
  localStorage.setItem('beaver-language', 'zh-CN')
  localStorage.setItem('theme', 'dark')
  await startApplication(async () => ({ mountApp: () => {} }))
  expect(document.getElementById('app-startup-status')?.textContent).toBe(
    '正在加载…',
  )
  expect(
    document.getElementById('app-startup')?.getAttribute('data-theme'),
  ).toBe('dark')
})

it('still starts when browser storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('unavailable')
  })
  const mountApp = vi.fn()
  await startApplication(async () => ({ mountApp }))
  expect(mountApp).toHaveBeenCalledOnce()
})

it('keeps startup visible during route preparation and offers retry on failure', async () => {
  let reject!: (error: Error) => void
  const preparation = new Promise<void>((_resolve, fail) => {
    reject = fail
  })
  const start = startApplication(async () => ({ mountApp: () => preparation }))
  await Promise.resolve()
  expect(document.getElementById('app-startup')).not.toBeNull()
  reject(new Error('route data unavailable'))
  await start
  expect(
    document.getElementById('app-startup')?.hasAttribute('data-failed'),
  ).toBe(true)
})
