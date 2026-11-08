// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionAccountPicker } from './transaction-account-picker'

vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useFragment: () => ({ balance: '100' }),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrencyWithPrivacyMode: () => '$100.00',
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
})

it('clears an account selection that falls outside the current view scope', async () => {
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

  await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(''))
})
