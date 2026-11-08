// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { TransactionDialogPreview } from './transaction-dialog-preview'
import type { transactionDialogPreviewFragment$key } from './__generated__/transactionDialogPreviewFragment.graphql'

const state = vi.hoisted(() => ({ privacy: false }))

vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useFragment: (_fragment: unknown, data: unknown) => data,
}))
vi.mock('@/components/category-icon', () => ({
  CategoryIcon: () => <span aria-hidden="true">category icon</span>,
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { locale: 'en-US' } }),
}))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: state.privacy }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: ({ value }: { value: string }) =>
      state.privacy ? '•••••••' : `$${value}`,
  }),
}))

const transaction = {
  datetime: '2026-09-07T12:00:00Z',
  excludeFromReports: false,
  category: { icon: null, name: 'Restaurant', type: 'expense' },
  transactionEntries: [
    {
      id: 'entry-1',
      amount: '-56.09',
      account: {
        name: 'Visa',
        householdCurrency: { code: 'CAD' },
      },
    },
  ],
  investmentLots: [],
} as unknown as transactionDialogPreviewFragment$key

afterEach(() => {
  cleanup()
  state.privacy = false
})

it('renders normalized transaction data while editing controls load', () => {
  render(<TransactionDialogPreview fragmentRef={transaction} />)

  expect(screen.getByRole('heading', { name: 'Edit Transaction' })).toBeTruthy()
  expect(screen.getByText('Restaurant')).toBeTruthy()
  expect(screen.getByText('Visa')).toBeTruthy()
  expect(screen.getByText(/\$-56\.09/)).toBeTruthy()
  expect(screen.getByRole('status').textContent).toContain(
    'Loading transaction editing controls',
  )
  expect(
    document.querySelectorAll('[data-slot="transaction-dialog-preview-field"]'),
  ).toHaveLength(4)
  expect(screen.getByText('Description')).toBeTruthy()
  expect(screen.getByText('Date')).toBeTruthy()
  expect(screen.getByText('Category')).toBeTruthy()
  expect(screen.getByText('Options')).toBeTruthy()
})

it('masks cached financial values in privacy mode', () => {
  state.privacy = true
  render(<TransactionDialogPreview fragmentRef={transaction} />)

  expect(document.body.textContent).not.toContain('-56.09')
  expect(document.body.textContent).toContain('•••••••')
})
