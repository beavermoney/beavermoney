// @vitest-environment jsdom
import '@/test/browser-setup'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionInvestmentPicker } from './transaction-investment-picker'

const mobileState = vi.hoisted(() => ({ value: true, privacy: false }))

vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: mobileState.privacy }),
}))
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mobileState.value,
}))
vi.mock('@/lib/logo', () => ({
  getLogoCryptoURL: () => '',
  getLogoTickerURL: () => '',
}))
vi.mock('relay-runtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('relay-runtime')>()),
  readInlineData: (_fragment: unknown, fragmentRef: unknown) => fragmentRef,
}))
vi.mock('@/components/selection-rows', () => ({
  SelectionRows: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

const investments = [
  {
    id: 'index-fund',
    amount: '12.34567890123456789',
    name: 'Index Fund',
    symbol: 'IDX',
    type: 'stock',
    latestTransaction: { datetime: '2026-09-08T00:00:00Z' },
  },
  {
    id: 'bitcoin',
    amount: '0',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'crypto',
    latestTransaction: { datetime: '2026-09-07T00:00:00Z' },
  },
]

function Picker() {
  const [value, setValue] = useState('')
  return (
    <TransactionInvestmentPicker
      investments={investments as never}
      name="investment"
      label="Investment"
      value={value}
      onValueChange={setValue}
      onBlur={() => undefined}
      invalid={false}
    />
  )
}

afterEach(() => {
  cleanup()
  mobileState.value = true
  mobileState.privacy = false
})

it('searches investments by ticker and selects a result', async () => {
  render(<Picker />)
  fireEvent.click(screen.getByRole('button', { name: /Investment/ }))
  const input = screen.getByRole('combobox')
  fireEvent.change(input, { target: { value: 'IDX' } })
  fireEvent.click(await screen.findByRole('option', { name: /Index Fund/ }))
  expect(screen.queryByRole('listbox')).toBeNull()
  expect(screen.getByRole('button', { name: /Index Fund/ })).toBeTruthy()
})

it('keeps dependent investment choices disabled until an account is selected', () => {
  render(
    <TransactionInvestmentPicker
      investments={[]}
      name="investment"
      label="Investment"
      value=""
      onValueChange={vi.fn()}
      onBlur={vi.fn()}
      invalid={false}
      disabled
    />,
  )
  expect(
    screen
      .getByRole('button', { name: /Investment/ })
      .getAttribute('aria-disabled'),
  ).toBe('true')
})

it('displays no selection when the controlled value falls outside the current view scope', async () => {
  const onValueChange = vi.fn()
  const commonProps = {
    name: 'investment',
    label: 'Investment',
    value: 'index-fund',
    onValueChange,
    onBlur: vi.fn(),
    invalid: false,
  }
  const { rerender } = render(
    <TransactionInvestmentPicker
      investments={investments as never}
      {...commonProps}
    />,
  )

  expect(onValueChange).not.toHaveBeenCalled()

  rerender(<TransactionInvestmentPicker investments={[]} {...commonProps} />)

  expect(screen.queryByRole('button', { name: /Index Fund/ })).toBeNull()
  expect(onValueChange).not.toHaveBeenCalled()
})

it('keeps exact available shares tied to the selected holding and clears stale scoped selections', () => {
  const props = {
    investments: investments as never,
    name: 'investment',
    label: 'Investment',
    value: 'index-fund',
    onValueChange: vi.fn(),
    onBlur: vi.fn(),
    invalid: false,
    showAvailableShares: true,
  }
  const view = render(<TransactionInvestmentPicker {...props} />)
  expect(
    screen.getByRole('button', { name: /Index Fund/ }).textContent,
  ).toContain('(12.34567890123456789 shares)')
  view.rerender(<TransactionInvestmentPicker {...props} value="bitcoin" />)
  expect(screen.getByRole('button', { name: /Bitcoin/ }).textContent).toContain(
    '(0 shares)',
  )
  expect(
    screen.getByRole('button', { name: /Bitcoin/ }).textContent,
  ).not.toContain('12.34567890123456789')
  view.rerender(<TransactionInvestmentPicker {...props} investments={[]} />)
  expect(screen.queryByText(/shares\)/)).toBeNull()
  expect(
    screen.queryByRole('button', { name: /Index Fund|Bitcoin/ }),
  ).toBeNull()
  expect(props.onValueChange).not.toHaveBeenCalled()
})

it('masks available shares in both selected value and searchable options', async () => {
  mobileState.privacy = true
  const props = {
    investments: investments as never,
    name: 'investment',
    label: 'Investment',
    value: 'index-fund',
    onValueChange: vi.fn(),
    onBlur: vi.fn(),
    invalid: false,
    showAvailableShares: true,
  }
  const view = render(<TransactionInvestmentPicker {...props} />)
  expect(
    screen.getByRole('button', { name: /Index Fund/ }).textContent,
  ).toContain('(••• shares)')
  expect(screen.queryByText(/12\.34567890123456789/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Index Fund/ }))
  const option = await screen.findByRole('option', { name: /Index Fund/ })
  expect(option.textContent).toContain('Shares available: •••')
  expect(option.textContent).not.toContain('12.34567890123456789')
  mobileState.privacy = false
  view.rerender(<TransactionInvestmentPicker {...props} />)
  expect(
    screen.getAllByText('Shares available: 12.34567890123456789').length,
  ).toBeGreaterThan(0)
})
