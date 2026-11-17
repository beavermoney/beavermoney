// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ScrollingName } from './scrolling-name'

const originalAnimate = HTMLElement.prototype.animate

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: originalAnimate,
  })
})

function browser(reduced: boolean, width: number) {
  const cancel = vi.fn()
  const animate = vi.fn(() => ({ cancel }))
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnect
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(width)
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: animate,
  })
  return { animate, cancel, disconnect }
}

it('scrolls overflowing names and cleans up when removed', () => {
  const { animate, cancel, disconnect } = browser(false, 250)
  const { unmount } = render(<ScrollingName>Long account name</ScrollingName>)
  expect(animate).toHaveBeenCalledTimes(1)
  unmount()
  expect(cancel).toHaveBeenCalledTimes(1)
  expect(disconnect).toHaveBeenCalledTimes(1)
})

it.each([
  [false, 80],
  [true, 250],
])('keeps fitting or reduced-motion names still (%s, %s)', (reduced, width) => {
  const { animate } = browser(reduced, width)
  render(<ScrollingName>Account</ScrollingName>)
  expect(animate).not.toHaveBeenCalled()
})
