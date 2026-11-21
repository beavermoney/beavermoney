// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { restoreScrollPosition } from './restore-scroll-position'

const callbacks = new Set<() => void>()
class ResizeObserverMock {
  callback: () => void
  constructor(callback: () => void) {
    this.callback = callback
  }
  observe() {
    callbacks.add(this.callback)
  }
  disconnect() {
    callbacks.delete(this.callback)
  }
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)
afterEach(() => {
  document.body.replaceChildren()
  callbacks.clear()
})

function scrollport(height = 1000) {
  const node = document.createElement('div')
  node.append(document.createElement('div'))
  document.body.append(node)
  let top = 0
  let contentHeight = height
  Object.defineProperty(node, 'scrollTop', {
    get: () => top,
    set: (value: number) => {
      top = Math.max(0, Math.min(value, contentHeight - 400))
    },
  })
  return {
    node,
    grow: (height: number) => {
      contentHeight = height
      for (const callback of [...callbacks]) callback()
    },
  }
}
it('restores immediately when retained pages already fill the list', () => {
  const { node } = scrollport(6000)
  restoreScrollPosition(node, { scrollX: 0, scrollY: 4200 })
  expect(node.scrollTop).toBe(4200)
  expect(callbacks.size).toBe(0)
})
it('advances through multiple asynchronous pages until the saved row is reachable', () => {
  const { node, grow } = scrollport()
  restoreScrollPosition(node, { scrollX: 0, scrollY: 4200 })
  expect(node.scrollTop).toBe(600)
  grow(2000)
  expect(node.scrollTop).toBe(1600)
  grow(3500)
  expect(node.scrollTop).toBe(3100)
  grow(6000)
  expect(node.scrollTop).toBe(4200)
  expect(callbacks.size).toBe(0)
  node.scrollTop = 500
  grow(7000)
  expect(node.scrollTop).toBe(500)
})
it('retries when a suspended list replaces its placeholder', async () => {
  let available = false
  let top = 0
  // Start with a placeholder whose scroll range is too small.
  const placeholder = document.createElement('div')
  Object.defineProperty(placeholder, 'scrollTop', {
    get: () => top,
    set: (value: number) => {
      top = available ? value : 0
    },
  })
  document.body.append(placeholder)
  const stop = restoreScrollPosition(placeholder, { scrollX: 0, scrollY: 2000 })
  available = true
  placeholder.append(document.createElement('p'))
  await new Promise<void>((resolve) => queueMicrotask(resolve))
  expect(placeholder.scrollTop).toBe(2000)
  stop()
})
it.each(['wheel', 'touchstart', 'pointerdown', 'keydown'])(
  'lets user %s input cancel a delayed restore',
  (type) => {
    const { node, grow } = scrollport()
    restoreScrollPosition(node, { scrollX: 0, scrollY: 4200 })
    node.dispatchEvent(
      type === 'keydown'
        ? new KeyboardEvent(type, { key: 'PageUp' })
        : new Event(type),
    )
    node.scrollTop = 100
    grow(6000)
    expect(node.scrollTop).toBe(100)
    expect(callbacks.size).toBe(0)
  },
)
it('cleans up pending restoration when navigating away', () => {
  const { node, grow } = scrollport()
  const stop = restoreScrollPosition(node, { scrollX: 0, scrollY: 4200 })
  stop()
  grow(6000)
  expect(node.scrollTop).toBe(600)
  expect(callbacks.size).toBe(0)
})
