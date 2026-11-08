// @vitest-environment jsdom
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

it('collapses to the selected investment and expands when clicked', () => {
  render(<Picker />)

  fireEvent.click(screen.getByRole('radio', { name: /Index Fund/ }))
  const summary = screen.getByRole('button', {
    name: 'Investment: Index Fund',
  })
  expect(screen.queryByRole('radio', { name: /Bitcoin/ })).toBeNull()

  fireEvent.click(summary)
  expect(screen.getByRole('radio', { name: /Bitcoin/ })).not.toBeNull()
})

it('shows investment identity in desktop options and the selected trigger', () => {
  mobileState.value = false
  render(<Picker />)

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Investment: Select an investment',
    }),
  )
  expect(
    screen.getByRole('group', { name: 'Scrollable content' }),
  ).not.toBeNull()
  fireEvent.click(
    screen.getByRole('menuitemradio', { name: 'Index Fund, IDX' }),
  )

  expect(screen.queryByRole('menu')).toBeNull()
  expect(
    screen.getByRole('button', { name: 'Investment: Index Fund, IDX' }),
  ).toBeTruthy()
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
