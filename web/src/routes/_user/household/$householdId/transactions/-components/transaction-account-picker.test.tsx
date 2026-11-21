// @vitest-environment jsdom
import '@/test/browser-setup'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionAccountPicker } from './transaction-account-picker'

const state = vi.hoisted(() => ({ privacy: false, format: vi.fn() }))

vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useFragment: () => ({ balance: '100' }),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: (input: {
      value: string
      currencyCode: string
    }) => {
      state.format(input)
      return state.privacy
        ? '•••'
        : new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: input.currencyCode,
          }).format(Number(input.value))
    },
  }),
}))
vi.mock('@/lib/logo', () => ({ getLogoDomainURL: () => '' }))
vi.mock('relay-runtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('relay-runtime')>()),
  readInlineData: (_fragment: unknown, fragmentRef: unknown) => fragmentRef,
}))

const account = {
  id: 'account-1',
  name: 'Checking',
  type: 'liquidity',
  icon: null,
  balance: '100',
  householdCurrency: { code: 'USD' },
} as never

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  state.privacy = false
})

it('displays no selection when the controlled value falls outside the current view scope', async () => {
  const onValueChange = vi.fn()
  const commonProps = {
    name: 'accountId',
    label: 'Account',
    value: 'account-1',
    onValueChange,
    onBlur: vi.fn(),
    invalid: false,
  }
  const { rerender } = render(
    <TransactionAccountPicker accounts={[account]} {...commonProps} />,
  )

  expect(onValueChange).not.toHaveBeenCalled()

  rerender(<TransactionAccountPicker accounts={[]} {...commonProps} />)

  expect(screen.queryByRole('button', { name: /Checking/ })).toBeNull()
  expect(onValueChange).not.toHaveBeenCalled()
})

it('shows available cash in the selected account native currency and follows account changes', () => {
  const accounts = [
    {
      id: 'cad',
      name: 'Canadian broker',
      type: 'investment',
      icon: null,
      balance: '123.45',
      householdCurrency: { code: 'CAD' },
    },
    {
      id: 'usd',
      name: 'US broker',
      type: 'investment',
      icon: null,
      balance: '0',
      householdCurrency: { code: 'USD' },
    },
  ]
  const props = {
    accounts: accounts as never,
    name: 'accountId',
    label: 'Account',
    value: 'cad',
    onValueChange: vi.fn(),
    onBlur: vi.fn(),
    invalid: false,
    showCashAvailable: true,
  }
  const view = render(<TransactionAccountPicker {...props} />)
  expect(screen.getByText('(CA$123.45 CAD)')).toBeTruthy()
  expect(state.format).toHaveBeenCalledWith({
    value: '123.45',
    currencyCode: 'CAD',
  })
  view.rerender(<TransactionAccountPicker {...props} value="usd" />)
  expect(screen.getByText('($0.00 USD)')).toBeTruthy()
  expect(screen.queryByText('(CA$123.45 CAD)')).toBeNull()
  state.privacy = true
  view.rerender(<TransactionAccountPicker {...props} />)
  expect(screen.getByText('(••• CAD)')).toBeTruthy()
  expect(screen.queryByText(/123\.45/)).toBeNull()
  view.rerender(<TransactionAccountPicker {...props} accounts={[]} />)
  expect(screen.queryByText(/CAD\)|USD\)/)).toBeNull()
})
