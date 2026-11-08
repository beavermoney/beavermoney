// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { FinancialSummaryCards } from './financial-summary-cards'
import type { financialSummaryCardsFragment$key } from './__generated__/financialSummaryCardsFragment.graphql'

const state = vi.hoisted(() => ({
  income: '1000',
  expenses: '250',
  privacy: false,
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('react-relay', () => ({
  useFragment: () => ({
    incomeBreakdown: { total: state.income },
    expensesBreakdown: { total: state.expenses },
  }),
}))
vi.mock('relay-runtime', () => ({ graphql: () => ({}) }))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { locale: 'en-CA' } }),
}))
vi.mock('@/hooks/use-display-currency', () => ({
  useDisplayCurrency: () => ({ displayCurrencyCode: 'CAD' }),
}))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: state.privacy }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: ({ value }: { value: { value: number } }) =>
      state.privacy ? '•••••••' : `$${value.value.toFixed(2)}`,
  }),
}))
const show = () =>
  render(
    <FinancialSummaryCards
      fragmentRef={{} as financialSummaryCardsFragment$key}
    />,
  )
afterEach(() => {
  cleanup()
  state.income = '1000'
  state.expenses = '250'
  state.privacy = false
})

it('shows the share of income saved with two decimal places', () => {
  show()
  expect(screen.getByText('75.00%')).toBeTruthy()
  expect(screen.queryByText('Of income saved')).toBeNull()
})
it('rounds fractional percentages to two decimals', () => {
  state.income = '3'
  state.expenses = '1'
  show()
  expect(screen.getByText('66.67%')).toBeTruthy()
})
it.each(['0', '100'])(
  'shows a dash for zero income with expenses of %s',
  (expenses) => {
    state.income = '0'
    state.expenses = expenses
    show()
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.queryByText('No income this period')).toBeNull()
  },
)
it('keeps a negative rate without explanatory copy', () => {
  state.expenses = '1250'
  show()
  expect(screen.getByText('-25.00%')).toBeTruthy()
  expect(screen.queryByText('Spending exceeded income')).toBeNull()
})
it('shows zero savings when spending equals income', () => {
  state.expenses = '1000'
  show()
  expect(screen.getByText('0.00%')).toBeTruthy()
})
it('does not describe negative income as ordinary savings', () => {
  state.income = '-100'
  show()
  expect(screen.getByText('—')).toBeTruthy()
  expect(screen.queryByText('No positive income this period')).toBeNull()
})
it('masks the rate in privacy mode', () => {
  state.expenses = '1250'
  state.privacy = true
  show()
  expect(screen.getAllByText('•••••••')).toHaveLength(4)
  expect(screen.queryByText('Spending exceeded income')).toBeNull()
  expect(screen.queryByText('-25.00%')).toBeNull()
})
