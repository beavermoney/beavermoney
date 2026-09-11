// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionAccountPicker } from './transaction-account-picker'

const mobileState = vi.hoisted(() => ({ value: false }))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
})
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
Element.prototype.scrollIntoView = vi.fn()

vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useFragment: () => ({ balance: '100' }),
}))
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mobileState.value,
}))
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
  user: { name: 'Joey' },
} as never

const manyAccounts = Array.from({ length: 6 }, (_, index) => ({
  id: `account-${index + 1}`,
  name: `Account ${index + 1}`,
  type: 'liquidity',
  icon: null,
  balance: '100',
  householdCurrency: { code: 'USD' },
  user: { name: 'Joey' },
  latestTransaction: {
    datetime: `2026-09-0${index + 1}T00:00:00Z`,
  },
})) as never

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  mobileState.value = false
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

it('searches every recency-sorted account on desktop', () => {
  render(
    <TransactionAccountPicker
      accounts={manyAccounts}
      name="accountId"
      label="Account"
      value=""
      onValueChange={() => undefined}
      onBlur={() => undefined}
      invalid={false}
    />,
  )

  fireEvent.click(
    screen.getByRole('button', { name: 'Account: Select an account' }),
  )

  const options = screen.getAllByRole('option')
  expect(options).toHaveLength(6)
  expect(options[0]?.textContent).toContain('Account 6')
  expect(options[5]?.textContent).toContain('Account 1')

  fireEvent.change(screen.getByRole('combobox', { name: 'Search account' }), {
    target: { value: 'Account 1' },
  })
  expect(screen.getByText('Account 1')).toBeTruthy()
  expect(screen.queryByText('Account 6')).toBeNull()
})

it('shows the account owner alongside the balance and currency', () => {
  render(
    <TransactionAccountPicker
      accounts={[account]}
      name="accountId"
      label="Account"
      value="account-1"
      onValueChange={() => undefined}
      onBlur={() => undefined}
      invalid={false}
    />,
  )

  expect(screen.getByRole('button').textContent).toContain('$100.00 USD · Joey')
})

it('opens a searchable account drawer on mobile', async () => {
  mobileState.value = true
  render(
    <TransactionAccountPicker
      accounts={manyAccounts}
      name="accountId"
      label="Account"
      value=""
      onValueChange={() => undefined}
      onBlur={() => undefined}
      invalid={false}
    />,
  )

  fireEvent.click(
    screen.getByRole('button', { name: 'Account: Select an account' }),
  )
  expect(await screen.findByRole('dialog')).toBeTruthy()
  expect(
    document.querySelector('[data-slot="drawer-popup"]')?.className,
  ).toContain('h-[min(45dvh,24rem)]')

  fireEvent.change(screen.getByRole('combobox', { name: 'Search account' }), {
    target: { value: 'Account 1' },
  })
  expect(screen.getByText('Account 1')).toBeTruthy()
  expect(screen.queryByText('Account 6')).toBeNull()
})
