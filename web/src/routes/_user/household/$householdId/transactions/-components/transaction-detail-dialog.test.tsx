// @vitest-environment jsdom
import '@/test/browser-setup'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { TransactionDetailDialog } from './transaction-detail-dialog'
const state = vi.hoisted(() => ({
  pending: null as Promise<void> | null,
  mobile: false,
}))
vi.mock('react-relay', () => ({
  useLazyLoadQuery: () => {
    if (state.pending) throw state.pending
    return {}
  },
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => state.mobile }))
vi.mock('@/components/page-progress', () => ({
  PageProgress: () => <p role="status">Loading</p>,
}))
vi.mock('@astryxdesign/core/Dialog', () => ({
  Dialog: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) =>
    isOpen ? <section role="dialog">{children}</section> : null,
  DialogHeader: () => null,
}))
vi.mock('@astryxdesign/core/BottomSheet', () => ({
  BottomSheet: ({
    children,
    isOpen,
  }: {
    children: ReactNode
    isOpen: boolean
  }) => (isOpen ? <section role="dialog">{children}</section> : null),
}))
vi.mock('./edit-transaction-dialog', () => ({
  EditTransactionDialogQuery: {},
  EditTransactionDialog: () => <p>Ready form</p>,
  LazyEditTransactionDialog: () => <p>Ready form</p>,
}))
afterEach(() => {
  cleanup()
  state.pending = null
})

it.each([false, true])(
  'keeps the underlying page unchanged until the editor is ready (mobile=%s)',
  async (mobile) => {
    state.mobile = mobile
    let resolve!: () => void
    state.pending = new Promise<void>((done) => {
      resolve = done
    })
    render(
      <>
        <p>Transaction list</p>
        <TransactionDetailDialog
          transactionId="1"
          retainedTransactionId="1"
          viewUserIds={null}
          queryRef={null}
          onClose={() => {}}
          onCloseComplete={() => {}}
        />
      </>,
    )
    expect(screen.getByText('Transaction list')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    await act(async () => {
      state.pending = null
      resolve()
    })
    expect(screen.getByRole('dialog').textContent).toBe('Ready form')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('Transaction list')).toBeTruthy()
  },
)
