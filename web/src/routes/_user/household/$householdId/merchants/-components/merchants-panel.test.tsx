// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MerchantsPanel } from './merchants-panel'
const state = vi.hoisted(() => ({ privacy: false }))
const summary = (total: string, transactionCount: number) => ({
  total,
  transactionCount,
  average: '10',
})
const data = {
  merchantInsights: {
    currencyCode: 'EUR',
    total: summary('100', 10),
    unassigned: summary('20', 2),
    merchants: [
      {
        merchant: { id: 'grocery', name: 'Grocery', icon: null },
        summary: summary('50', 5),
      },
      {
        merchant: { id: 'cafe', name: 'Café', icon: null },
        summary: summary('30', 8),
      },
      {
        merchant: { id: 'new', name: 'New merchant', icon: null },
        summary: summary('0', 0),
      },
    ],
  },
}
vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useFragment: (_fragment: unknown, ref: unknown) => ref,
}))
vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ householdId: 'household' }),
  useRouter: () => ({ buildLocation: () => ({ href: '/grocery' }) }),
}))
vi.mock('@/hooks/use-history-state', async () => {
  const { useState } = await import('react')
  return {
    useHistoryState: (_name: string, initial: string) => useState(initial),
  }
})
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: state.privacy }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: ({
      value,
      currencyCode,
    }: {
      value: string
      currencyCode: string
    }) => (state.privacy ? '•••' : `${currencyCode} ${value}`),
  }),
}))
vi.mock('@/components/merchant-avatar', () => ({
  MerchantAvatar: ({ merchant }: { merchant: { name: string } }) => (
    <svg role="img" aria-label={merchant.name} />
  ),
}))
vi.mock('@/components/date-period-filter', () => ({
  DatePeriodFilter: () => <p>Selected period</p>,
}))
vi.mock('./merchant-editor', () => ({ MerchantEditor: () => null }))
vi.mock('@/components/router-list-item', () => ({
  RouterListItem: ({
    label,
    description,
    endContent,
    startContent,
    params,
  }: {
    label: string
    description: string
    endContent: React.ReactNode
    startContent: React.ReactNode
    params: { merchantId?: string }
  }) => (
    <li>
      <a href={`/${params.merchantId ?? 'unassigned'}`}>
        {startContent}
        {label}
        {description}
        {endContent}
      </a>
    </li>
  ),
}))
afterEach(() => {
  cleanup()
  state.privacy = false
})

it('shows only the period leaderboard and switches between exact spending and transaction count rankings', () => {
  render(
    <MerchantsPanel
      fragmentRef={data as never}
      start="2026-11-01"
      end="2026-11-30"
      onDateRangeChange={vi.fn()}
    />,
  )
  expect(screen.queryByText('Spent this period')).toBeNull()
  expect(screen.queryByText('Top merchant')).toBeNull()
  expect(screen.queryByRole('textbox', { name: 'Search merchants' })).toBeNull()
  const list = screen.getByRole('list', { name: 'Merchant leaderboard' })
  const order = () =>
    within(list)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
  expect(order()).toEqual(['/grocery', '/cafe', '/new'])
  expect(within(list).getByText('EUR 50')).toBeTruthy()
  expect(screen.getByRole('list', { name: 'Unassigned expenses' })).toBeTruthy()
  fireEvent.click(screen.getByRole('radio', { name: 'Count' }))
  expect(order()).toEqual(['/cafe', '/grocery', '/new'])
  expect(within(list).getByText('8 transactions')).toBeTruthy()
  fireEvent.click(screen.getByRole('radio', { name: 'Spend' }))
  expect(order()).toEqual(['/grocery', '/cafe', '/new'])
})
it('masks monetary totals while retaining useful merchant identities', () => {
  state.privacy = true
  render(
    <MerchantsPanel
      fragmentRef={data as never}
      start="2026-11-01"
      end="2026-11-30"
      onDateRangeChange={vi.fn()}
    />,
  )
  expect(screen.queryByText(/EUR /)).toBeNull()
  expect(screen.queryByText(/%$/)).toBeNull()
  expect(screen.getAllByText('•••').length).toBeGreaterThan(3)
  expect(screen.getByRole('link', { name: /Grocery/ })).toBeTruthy()
})
