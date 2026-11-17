// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NewInvestment } from './new-investment'
const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  toast: vi.fn(),
  navigate: vi.fn(),
}))
vi.mock('@/lib/logo', () => ({
  getLogoDomainURL: () => undefined,
  getLogoTickerURL: () => undefined,
  getLogoCryptoURL: () => undefined,
}))
vi.mock('@/environment', () => ({ environment: {} }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { id: 'household' } }),
}))
vi.mock('@/hooks/use-display-currency', () => ({
  useDisplayCurrency: () => ({ displayCurrencyCode: 'CAD' }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatCurrency: () => '$10',
    formatCurrencyWithPrivacyMode: () => '$10',
  }),
}))
vi.mock('@astryxdesign/core/Toast', () => ({ useToast: () => mocks.toast }))
vi.mock('react-relay', async (original) => ({
  ...(await original<typeof import('react-relay')>()),
  useFragment: (_: unknown, data: unknown) => data,
  useMutation: () => [vi.fn(), false],
  fetchQuery: (...args: unknown[]) => ({
    toPromise: () => mocks.fetch(...args),
  }),
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
const quote = (name: string) => ({
  name,
  symbol: 'TEST',
  exchange: 'TSX',
  currency: 'CAD',
  currentPrice: '10',
})
function open() {
  render(
    <NewInvestment
      newInvestmentFragmentRef={{ accounts: { edges: [] } } as never}
      newInvestmentStockQuoteFragmentRef={{ stockQuote: null } as never}
      newInvestmentCryptoQuoteFragmentRef={{ cryptoQuote: null } as never}
    />,
  )
}
it('autofills a resolved quote, keeps manual edits until the next quote, and rejects stale responses', async () => {
  let first!: (data: unknown) => void
  let second!: (data: unknown) => void
  mocks.fetch
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          first = resolve
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          second = resolve
        }),
    )
  open()
  const symbol = screen.getByRole('textbox', { name: 'Symbol' })
  const name = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement
  fireEvent.change(symbol, { target: { value: 'FIRST' } })
  await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1))
  fireEvent.change(symbol, { target: { value: 'SECOND' } })
  await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(2))
  await act(async () => second({ stockQuote: quote('Second company') }))
  expect(name.value).toBe('Second company')
  fireEvent.change(name, { target: { value: 'My custom name' } })
  await act(async () => first({ stockQuote: quote('Stale company') }))
  expect(name.value).toBe('My custom name')
  mocks.fetch.mockResolvedValueOnce({ stockQuote: quote('Third company') })
  fireEvent.change(symbol, { target: { value: 'THIRD' } })
  await waitFor(() => expect(name.value).toBe('Third company'))
})
it('shows the missing-quote error after the lookup and clears it after a successful lookup', async () => {
  mocks.fetch
    .mockResolvedValueOnce({ stockQuote: null })
    .mockResolvedValueOnce({ stockQuote: quote('Found') })
  open()
  const symbol = screen.getByRole('textbox', { name: 'Symbol' })
  fireEvent.change(symbol, { target: { value: 'MISSING' } })
  fireEvent.blur(symbol)
  await screen.findByText('Unable to find a quote for this symbol.')
  fireEvent.change(symbol, { target: { value: 'FOUND' } })
  await waitFor(() =>
    expect(
      (screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value,
    ).toBe('Found'),
  )
  expect(symbol.getAttribute('aria-invalid')).not.toBe('true')
})

it('switches quote preview and clears symbol/name when changing investment type', async () => {
  mocks.fetch.mockResolvedValueOnce({ stockQuote: quote('Stock company') })
  open()
  fireEvent.change(screen.getByRole('textbox', { name: 'Symbol' }), {
    target: { value: 'TEST' },
  })
  await waitFor(() =>
    expect(
      (screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value,
    ).toBe('Stock company'),
  )
  fireEvent.click(screen.getByRole('button', { name: /Type stock/ }))
  fireEvent.click(await screen.findByRole('option', { name: 'Crypto' }))
  expect(
    (screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value,
  ).toBe('')
  expect(
    (screen.getByRole('textbox', { name: 'Symbol' }) as HTMLInputElement).value,
  ).toBe('')
  expect(screen.queryByText('Stock company')).toBeNull()
  expect(screen.getByText(/Enter a currency pair/)).toBeTruthy()
})
