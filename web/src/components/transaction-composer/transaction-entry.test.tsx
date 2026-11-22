// @vitest-environment jsdom
import '@/test/browser-setup'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionEntry } from './transaction-entry'

const state = vi.hoisted(() => ({ open: false, loads: vi.fn() }))
vi.mock('./use-transaction-entry-data', () => ({
  useTransactionEntryData: () => ({}),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }))
vi.mock('@/hooks/use-log-transaction', () => ({
  useLogTransaction: () => ({
    type: state.open ? 'expense' : null,
    close: vi.fn(),
  }),
}))
vi.mock('./transaction-entry-content', () => {
  state.loads()
  return { default: () => <p>Editor ready</p> }
})
// Keep children mounted even when closed, as overlay implementations may do.
vi.mock('@astryxdesign/core/BottomSheet', () => ({
  BottomSheet: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}))
afterEach(cleanup)
it('loads the editor only when New is opened', async () => {
  const view = render(<TransactionEntry />)
  expect(state.loads).not.toHaveBeenCalled()
  expect(screen.queryByText('Editor ready')).toBeNull()
  state.open = true
  view.rerender(<TransactionEntry />)
  expect(await screen.findByText('Editor ready')).toBeTruthy()
  expect(state.loads).toHaveBeenCalledTimes(1)
})
