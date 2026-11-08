// @vitest-environment jsdom
import '@/test/browser-setup'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useState, type ComponentProps } from 'react'
import { TransactionsList } from './transactions-list'
import type { TransactionsTable } from './transactions-table'
import type { transactionsListFragment$key } from './__generated__/transactionsListFragment.graphql'

const relay = vi.hoisted(() => ({
  loadNext: vi.fn(),
  refetch: vi.fn(),
  loadEditQuery: vi.fn(),
  disposeEditQuery: vi.fn(),
  invalidate: () => {},
  queryRef: null as null | { variables: { transactionId: string } },
}))
const router = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: { edit_transaction_id: null as string | null },
  searchFrom: undefined as string | undefined,
}))
const viewScope = vi.hoisted(() => ({
  viewUserIds: null as string[] | null,
}))
vi.mock('react-relay', () => ({
  usePaginationFragment: () => ({
    data: { id: 'household', transactions: { __id: 'connection', edges: [] } },
    loadNext: relay.loadNext,
    refetch: relay.refetch,
    hasNext: true,
    isLoadingNext: false,
  }),
  useSubscribeToInvalidationState: (_ids: string[], callback: () => void) => {
    relay.invalidate = callback
  },
  useQueryLoader: () => [
    relay.queryRef,
    relay.loadEditQuery,
    relay.disposeEditQuery,
  ],
}))
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => router.navigate,
  useSearch: (options?: {
    from?: string
    select?: (search: typeof router.search) => unknown
  }) => {
    router.searchFrom = options?.from
    return options?.select ? options.select(router.search) : router.search
  },
}))
vi.mock('relay-runtime', () => ({ graphql: () => ({}) }))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/hooks/use-household-view-scope', () => ({
  useHouseholdViewScope: () => viewScope,
}))
vi.mock('@/lib/relay', () => ({
  NodeType: { Transaction: 'Transaction' },
  useRegisterConnection: () => {},
}))
vi.mock('react-intersection-observer', () => ({
  useInView: () => [() => {}, false],
}))
vi.mock('./transaction-card', () => ({ TransactionCard: () => null }))
vi.mock('./edit-transaction-dialog', () => ({
  EditTransactionDialog: () => {
    const [editingEntry, setEditingEntry] = useState(false)
    return (
      <button onClick={() => setEditingEntry(true)}>
        {editingEntry ? 'Editing entry' : 'Transaction details'}
      </button>
    )
  },
  EditTransactionDialogQuery: {},
}))
vi.mock('./transaction-dialog-preview', () => ({
  TransactionDialogPreview: () => null,
}))
vi.mock('./transactions-table', () => ({
  TransactionsTable: (props: ComponentProps<typeof TransactionsTable>) => (
    <>
      <button onClick={props.onToggleSort}>{props.direction}</button>
      <button onClick={props.onLoadMore}>Next page</button>
      {props.loadError && <span role="alert">{props.loadError}</span>}
    </>
  ),
}))
const fragmentRef = {} as transactionsListFragment$key

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  router.search.edit_transaction_id = null
  relay.queryRef = null
  router.searchFrom = undefined
  viewScope.viewUserIds = null
})

it('reads dialog search state from the shared household route', () => {
  render(<TransactionsList fragmentRef={fragmentRef} />)

  expect(router.searchFrom).toBe('/_user/household/$householdId')
})

it('sorts through Relay with a fresh cursor and refreshes the active ASC connection on invalidation', () => {
  render(<TransactionsList fragmentRef={fragmentRef} />)
  act(() => relay.invalidate())
  expect(relay.refetch).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'DESC' }))
  expect(relay.refetch).toHaveBeenLastCalledWith(
    {
      orderBy: { field: 'DATETIME', direction: 'ASC' },
      cursor: null,
      count: 20,
    },
    expect.objectContaining({ fetchPolicy: 'store-and-network' }),
  )
  expect(screen.getByRole('button', { name: 'ASC' })).toBeTruthy()
  act(() => relay.invalidate())
  expect(relay.refetch).toHaveBeenLastCalledWith(
    { cursor: null, count: 20 },
    { fetchPolicy: 'network-only' },
  )
})

it('reports pagination failures and clears the error when retrying', () => {
  render(<TransactionsList fragmentRef={fragmentRef} />)
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(relay.loadNext).toHaveBeenCalledWith(50, expect.any(Object))
  act(() => relay.loadNext.mock.calls[0][1].onComplete(new Error('Offline')))
  expect(screen.getByRole('alert').textContent).toBe(
    'Could not load more transactions.',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  act(() => relay.loadNext.mock.calls[1][1].onComplete(null))
  expect(screen.queryByRole('alert')).toBeNull()
  expect(relay.loadNext).toHaveBeenCalledTimes(2)
})

it('loads a deep-linked transaction without reloading the page query', () => {
  router.search.edit_transaction_id = 'transaction-1'
  render(<TransactionsList fragmentRef={fragmentRef} />)

  expect(relay.loadEditQuery).toHaveBeenCalledWith(
    { transactionId: 'transaction-1', viewUserIds: null },
    { fetchPolicy: 'store-or-network' },
  )
})

it('scopes edit-dialog account choices to the selected household members', () => {
  router.search.edit_transaction_id = 'transaction-1'
  viewScope.viewUserIds = ['user-1', 'user-2']

  render(<TransactionsList fragmentRef={fragmentRef} />)

  expect(relay.loadEditQuery).toHaveBeenCalledWith(
    {
      transactionId: 'transaction-1',
      viewUserIds: ['user-1', 'user-2'],
    },
    { fetchPolicy: 'store-or-network' },
  )
})

it('reloads an open edit dialog when the household view scope changes', () => {
  router.search.edit_transaction_id = 'transaction-1'
  viewScope.viewUserIds = ['user-1']
  const { rerender } = render(<TransactionsList fragmentRef={fragmentRef} />)

  viewScope.viewUserIds = ['user-2']
  rerender(<TransactionsList fragmentRef={fragmentRef} />)

  expect(relay.loadEditQuery).toHaveBeenLastCalledWith(
    { transactionId: 'transaction-1', viewUserIds: ['user-2'] },
    { fetchPolicy: 'store-or-network' },
  )
  expect(relay.loadEditQuery).toHaveBeenCalledTimes(2)
})

it('starts at transaction details when the same transaction is reopened', () => {
  router.search.edit_transaction_id = 'transaction-1'
  relay.queryRef = { variables: { transactionId: 'transaction-1' } }
  const { rerender } = render(<TransactionsList fragmentRef={fragmentRef} />)
  fireEvent.click(screen.getByRole('button', { name: 'Transaction details' }))
  expect(screen.getByRole('button', { name: 'Editing entry' })).toBeTruthy()
  router.search.edit_transaction_id = null
  rerender(<TransactionsList fragmentRef={fragmentRef} />)
  router.search.edit_transaction_id = 'transaction-1'
  rerender(<TransactionsList fragmentRef={fragmentRef} />)
  expect(
    screen.getByRole('button', { name: 'Transaction details' }),
  ).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Editing entry' })).toBeNull()
})
