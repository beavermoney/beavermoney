// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { logTransactionStore } from './log-transaction-store'
import { useLogTransaction } from './use-log-transaction'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pathname: '/household/test/transactions',
}))
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate,
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown
  }) => select({ location: { pathname: mocks.pathname } }),
}))
beforeEach(() => {
  mocks.navigate.mockClear()
  mocks.pathname = '/household/test/transactions'
  logTransactionStore.setState(() => ({ type: null }))
})
afterEach(cleanup)

it('opens and closes over the current page without navigating', () => {
  const { result } = renderHook(() => useLogTransaction())
  act(() => result.current.open('expense', { accountId: 'checking' }))
  expect(result.current.isOpen).toBe(true)
  expect(result.current.defaults).toEqual({ accountId: 'checking' })
  act(() => result.current.close())
  expect(result.current.isOpen).toBe(false)
  expect(mocks.navigate).not.toHaveBeenCalled()
})

it('still returns from a directly opened legacy new-transaction page', () => {
  mocks.pathname = '/household/test/transactions/new'
  const { result } = renderHook(() => useLogTransaction())
  act(() => result.current.close())
  expect(mocks.navigate).toHaveBeenCalledWith(
    expect.objectContaining({
      to: '..',
      resetScroll: false,
    }),
  )
})
