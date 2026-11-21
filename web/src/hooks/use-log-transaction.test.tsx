// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { logTransactionStore } from './log-transaction-store'
import { useLogTransaction } from './use-log-transaction'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  back: vi.fn(),
  canGoBack: false,
  pathname: '/household/test/transactions',
}))
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    navigate: mocks.navigate,
    history: { back: mocks.back },
  }),
  useCanGoBack: () => mocks.canGoBack,
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown
  }) => select({ location: { pathname: mocks.pathname } }),
}))
beforeEach(() => {
  mocks.navigate.mockClear()
  mocks.back.mockClear()
  mocks.canGoBack = false
  mocks.pathname = '/household/test/transactions'
  logTransactionStore.setState(() => ({ type: null }))
})
afterEach(cleanup)

it('opens and closes over the current page without navigating', () => {
  mocks.canGoBack = true
  const { result } = renderHook(() => useLogTransaction())
  act(() => result.current.open('expense', { accountId: 'checking' }))
  expect(result.current.isOpen).toBe(true)
  expect(result.current.defaults).toEqual({ accountId: 'checking' })
  act(() => result.current.close())
  expect(result.current.isOpen).toBe(false)
  expect(mocks.navigate).not.toHaveBeenCalled()
  expect(mocks.back).not.toHaveBeenCalled()
})

it('still returns from a directly opened legacy new-transaction page', () => {
  mocks.pathname = '/household/test/transactions/new'
  const { result } = renderHook(() => useLogTransaction())
  act(() => result.current.close())
  expect(mocks.navigate).toHaveBeenCalledWith(
    expect.objectContaining({
      to: '..',
      replace: true,
      resetScroll: false,
    }),
  )
})

it('returns to the origin when closing a legacy transaction page with history', () => {
  mocks.pathname = '/household/test/transactions/new'
  mocks.canGoBack = true
  const { result } = renderHook(() => useLogTransaction())
  act(() => result.current.close())
  expect(mocks.back).toHaveBeenCalledOnce()
  expect(mocks.navigate).not.toHaveBeenCalled()
})
