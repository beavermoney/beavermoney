// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionInvestmentPicker } from './transaction-investment-picker'

const mobileState = vi.hoisted(() => ({ value: true }))

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
    name: 'Index Fund',
    symbol: 'IDX',
    type: 'stock',
    latestTransaction: { datetime: '2026-09-08T00:00:00Z' },
  },
  {
    id: 'bitcoin',
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

it('clears an investment selection that falls outside the current view scope', async () => {
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

  await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(''))
})
