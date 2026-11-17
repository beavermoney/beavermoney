// @vitest-environment jsdom
import { StrictMode } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useScreenSize } from './use-screen-size'
import { usePaginationSentinel } from './use-pagination-sentinel'
import { PrivacyModeProvider, usePrivacyMode } from './use-privacy-mode'
import { LOCAL_STORAGE_PRIVACY_MODE_KEY } from '@/constant'
import { useRegisterConnection } from '@/lib/relay/use-register-connection'
import { connectionRegistry } from '@/lib/relay/connection-registry'
import { NodeType } from '@/lib/relay/node-types'

const observers: Observer[] = []
class Observer {
  disconnect = vi.fn()
  observe = vi.fn()
  constructor(readonly callback: IntersectionObserverCallback) {
    observers.push(this)
  }
  intersect() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  observers.length = 0
})

it('reads every screen breakpoint and unsubscribes on unmount', () => {
  const remove = vi.spyOn(window, 'removeEventListener')
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1200,
  })
  const { result, unmount } = renderHook(useScreenSize)
  expect(result.current.toString()).toBe('lg')
  for (const [width, size] of [
    [639, 'xs'],
    [640, 'sm'],
    [768, 'md'],
    [1024, 'lg'],
    [1280, 'xl'],
    [1536, '2xl'],
  ] as const) {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: width,
      })
      window.dispatchEvent(new Event('resize'))
    })
    expect(result.current.toString()).toBe(size)
  }
  unmount()
  expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
})

function Sentinel({
  enabled = true,
  page = 1,
  load,
}: {
  enabled?: boolean
  page?: number
  load: () => void
}) {
  const ref = usePaginationSentinel({ enabled, onLoadMore: load })
  return <div key={page} ref={ref} />
}
it('loads once per observation, pauses in flight, and rechecks a still-visible next page', () => {
  vi.stubGlobal('IntersectionObserver', Observer)
  const load = vi.fn()
  const view = render(<Sentinel load={load} />)
  act(() => {
    observers[0].intersect()
    observers[0].intersect()
  })
  expect(load).toHaveBeenCalledTimes(1)
  view.rerender(<Sentinel enabled={false} load={load} />)
  expect(observers[0].disconnect).toHaveBeenCalledOnce()
  view.rerender(<Sentinel page={2} load={load} />)
  act(() => observers.at(-1)!.intersect())
  expect(load).toHaveBeenCalledTimes(2)
  view.unmount()
  expect(observers.at(-1)!.disconnect).toHaveBeenCalledOnce()
})
it('does not observe a failed or exhausted connection', () => {
  vi.stubGlobal('IntersectionObserver', Observer)
  render(<Sentinel enabled={false} load={vi.fn()} />)
  expect(observers).toHaveLength(0)
})

function PrivacyControls() {
  const { isPrivacyModeEnabled, togglePrivacyMode } = usePrivacyMode()
  return (
    <>
      <output>{String(isPrivacyModeEnabled)}</output>
      <button onClick={togglePrivacyMode}>Toggle</button>
      <button
        onClick={() => {
          togglePrivacyMode()
          togglePrivacyMode()
        }}
      >
        Twice
      </button>
    </>
  )
}
it('persists privacy toggles, supports consecutive updates, and restores after remount', () => {
  const view = render(
    <PrivacyModeProvider>
      <PrivacyControls />
    </PrivacyModeProvider>,
  )
  fireEvent.click(screen.getByText('Twice'))
  expect(screen.getByRole('status').textContent).toBe('false')
  fireEvent.click(screen.getByText('Toggle'))
  expect(localStorage.getItem(LOCAL_STORAGE_PRIVACY_MODE_KEY)).toBe('true')
  view.unmount()
  render(
    <PrivacyModeProvider>
      <PrivacyControls />
    </PrivacyModeProvider>,
  )
  expect(screen.getByRole('status').textContent).toBe('true')
})
function Connection({ id }: { id: string }) {
  const ref = useRegisterConnection(id, NodeType.Transaction)
  return <section ref={ref} />
}
it('retains shared Relay connections until the last surface unmounts, including Strict Mode', () => {
  const view = render(
    <StrictMode>
      <Connection id="audit-one" />
      <Connection id="audit-one" />
    </StrictMode>,
  )
  expect(connectionRegistry.getByType(NodeType.Transaction)).toContain(
    'audit-one',
  )
  view.rerender(
    <StrictMode>
      <Connection id="audit-two" />
    </StrictMode>,
  )
  expect(connectionRegistry.getByType(NodeType.Transaction)).not.toContain(
    'audit-one',
  )
  expect(connectionRegistry.getByType(NodeType.Transaction)).toContain(
    'audit-two',
  )
  view.unmount()
  expect(connectionRegistry.getByType(NodeType.Transaction)).not.toContain(
    'audit-two',
  )
})
