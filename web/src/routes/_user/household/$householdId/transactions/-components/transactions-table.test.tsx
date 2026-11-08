// @vitest-environment jsdom
import type { ReactNode } from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionsTable } from './transactions-table'
import type { transactionsTableFragment$key } from './__generated__/transactionsTableFragment.graphql'

HTMLElement.prototype.scrollTo = vi.fn()

const state = vi.hoisted(() => ({
  privacy: false,
  inView: false,
  navigate: vi.fn(),
}))
vi.mock('@/env', () => ({
  env: { VITE_SERVER_URL: 'https://api.example.test' },
}))
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: () => {}, inView: state.inView }),
}))
vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useFragment: (_fragment: unknown, data: unknown) => data,
}))
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => state.navigate,
  Link: ({ children, title }: { children: ReactNode; title: string }) => (
    <a href="#details" title={title}>
      {children}
    </a>
  ),
}))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: state.privacy }),
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { locale: 'en-US' } }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: ({ value }: { value: string }) =>
      state.privacy ? '•••••••' : value,
  }),
}))

const transactions = [
  {
    id: 'transfer',
    datetime: '2026-09-07T12:00:00Z',
    description: 'Currency transfer',
    excludeFromReports: true,
    category: { name: 'Transfer', type: 'transfer', icon: null },
    user: { name: 'Joey' },
    transactionEntries: [
      {
        id: 'out',
        amount: '-100',
        account: { name: 'Checking', householdCurrency: { code: 'CAD' } },
      },
      {
        id: 'in',
        amount: '72',
        account: { name: 'Savings', householdCurrency: { code: 'USD' } },
      },
    ],
    investmentLots: [],
  },
  {
    id: 'buy',
    datetime: '2026-09-06T12:00:00Z',
    description: 'Buy stock',
    excludeFromReports: false,
    category: { name: 'Buy', type: 'investment', icon: null },
    user: { name: 'Joey' },
    transactionEntries: [
      {
        id: 'cash',
        amount: '-1500',
        account: { name: 'Broker cash', householdCurrency: { code: 'USD' } },
      },
    ],
    investmentLots: [
      {
        id: 'lot',
        amount: '10',
        price: '150',
        investment: {
          symbol: 'AAPL',
          account: { name: 'Brokerage' },
          householdCurrency: { code: 'USD' },
        },
      },
    ],
  },
]
const defaults = {
  fragmentRef: transactions as unknown as transactionsTableFragment$key,
  direction: 'DESC' as const,
  loadError: null,
  onToggleSort: vi.fn(),
  isSorting: false,
  hasNext: true,
  isLoadingNext: false,
  onLoadMore: vi.fn(),
  onOpenTransaction: vi.fn(),
  onPreloadTransaction: vi.fn(),
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  state.inView = false
  state.privacy = false
})

it('keeps transfer legs and investment quantities separate with their currencies', () => {
  render(<TransactionsTable {...defaults} />)
  const transfer = screen.getByText('Currency transfer').closest('tr')!
  const cells = within(transfer).getAllByRole('cell')
  expect(cells[2].textContent).toBe('CheckingSavings')
  expect(cells[3].textContent).toBe('-100 CAD72 USD')
  expect(within(transfer).getByText('Excluded')).toBeTruthy()
  const buy = screen.getByText('Buy stock').closest('tr')!
  expect(within(buy).getAllByRole('cell')[3].textContent).toBe(
    '-1500 USD+10 AAPL @ 150 USD',
  )
  fireEvent.pointerEnter(transfer)
  expect(defaults.onPreloadTransaction).toHaveBeenCalledWith('transfer')
  fireEvent.click(within(transfer).getByText('Checking'))
  expect(defaults.onOpenTransaction).toHaveBeenCalledWith('transfer')
})

it('masks both cash amounts and investment quantities in privacy mode', () => {
  state.privacy = true
  render(<TransactionsTable {...defaults} />)
  const table = screen.getByRole('table')
  expect(table.textContent).not.toContain('-1500')
  expect(table.textContent).not.toContain('+10')
  expect(table.textContent).not.toContain('150 USD')
  expect(table.textContent).toContain('•••••••')
})

it('opens a transaction row from the keyboard', () => {
  render(<TransactionsTable {...defaults} />)
  const row = screen.getByText('Currency transfer').closest('tr')!
  fireEvent.keyDown(row, { key: 'Enter' })
  expect(defaults.onOpenTransaction).toHaveBeenCalledWith('transfer')
})

it('loads near the scroll boundary and pauses while sorting or loading', () => {
  const view = render(<TransactionsTable {...defaults} />)
  fireEvent.click(screen.getByRole('button', { name: /Date, newest/ }))
  expect(defaults.onToggleSort).toHaveBeenCalledOnce()
  expect(defaults.onLoadMore).not.toHaveBeenCalled()
  state.inView = true
  view.rerender(<TransactionsTable {...defaults} />)
  expect(defaults.onLoadMore).toHaveBeenCalledOnce()
  view.rerender(<TransactionsTable {...defaults} isSorting />)
  expect(
    screen
      .getByRole('button', { name: /Date, newest/ })
      .hasAttribute('disabled'),
  ).toBe(true)
  expect(defaults.onLoadMore).toHaveBeenCalledOnce()
  view.rerender(<TransactionsTable {...defaults} isLoadingNext />)
  expect(screen.getByText('Loading more transactions…')).toBeTruthy()
  expect(defaults.onLoadMore).toHaveBeenCalledOnce()
  view.rerender(<TransactionsTable {...defaults} hasNext={false} />)
  expect(defaults.onLoadMore).toHaveBeenCalledOnce()
})

it('renders an empty state without a pagination control', () => {
  render(<TransactionsTable {...defaults} fragmentRef={[]} hasNext={false} />)
  expect(screen.getByText('No transactions in this date range.')).toBeTruthy()
  expect(
    screen.queryByRole('button', { name: 'Load more transactions' }),
  ).toBeNull()
})

it('stops automatic pagination after a failure and offers an explicit retry', () => {
  state.inView = true
  render(
    <TransactionsTable
      {...defaults}
      loadError="Could not load more transactions."
    />,
  )
  expect(defaults.onLoadMore).not.toHaveBeenCalled()
  expect(
    screen.getByText('Could not load more transactions.').textContent,
  ).toContain('Could not load more transactions.')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(defaults.onLoadMore).toHaveBeenCalledOnce()
})
