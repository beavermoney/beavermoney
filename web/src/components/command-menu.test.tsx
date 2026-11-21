// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CommandMenu } from './command-menu'

const state = vi.hoisted(() => ({
  navigate: vi.fn<(_options: unknown) => Promise<void>>(async () => {}),
  load: vi.fn(),
  isOpen: true,
}))
vi.mock('@/lib/logo', () => ({
  getLogoDomainURL: (domain: string) => `https://${domain}/logo`,
  getLogoTickerURL: (symbol: string) => `https://example.com/${symbol}`,
  getLogoCryptoURL: (symbol: string) => `https://example.com/${symbol}`,
}))
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => state.navigate,
  useParams: () => ({ householdId: 'household' }),
  useSearch: () => ({ command_open: state.isOpen }),
}))
vi.mock('@tanstack/react-hotkeys', () => ({ useHotkey: vi.fn() }))
vi.mock('@/hooks/use-log-transaction', () => ({
  useLogTransaction: () => ({ open: vi.fn() }),
}))
vi.mock('@/hooks/use-household-view-scope', () => ({
  useHouseholdViewScope: () => ({ viewUserIds: ['owner'] }),
}))
vi.mock('react-relay', () => ({
  graphql: () => ({}),
  useRelayEnvironment: () => ({}),
  fetchQuery: (...args: unknown[]) => ({
    toPromise: () => state.load(...args),
  }),
}))

const account = {
  id: 'account1',
  name: 'Brokerage',
  icon: 'example.com',
  user: { name: 'Joey' },
  householdCurrency: { code: 'CAD' },
}
const data = {
  node: {
    accounts: { edges: [{ node: account }] },
    investments: {
      edges: [
        {
          node: {
            id: 'holding1',
            name: 'Apple',
            symbol: 'AAPL',
            type: 'stock',
            account,
          },
        },
      ],
    },
  },
}

beforeEach(() => {
  state.isOpen = true
  state.navigate.mockClear()
  state.load.mockReset().mockResolvedValue(data)
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  HTMLElement.prototype.scrollIntoView = vi.fn()
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('searches a holding by symbol and owner, then selects it with the keyboard', async () => {
  render(<CommandMenu />)
  await screen.findByRole('option', { name: /Apple/ })
  const input = screen.getByRole('combobox')
  fireEvent.change(input, { target: { value: 'aapl joey' } })
  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
  const option = screen.getByRole('option')
  expect(within(option).getByText('Apple')).toBeTruthy()
  expect(within(option).getByText('AAPL · Brokerage · Joey')).toBeTruthy()
  expect(within(option).getByRole('img', { name: 'Apple' })).toBeTruthy()
  expect(within(option).getByRole('img', { name: 'Brokerage' })).toBeTruthy()
  expect(within(option).getByRole('img', { name: 'Joey' })).toBeTruthy()
  expect(option.querySelectorAll('[tabindex="0"]')).toHaveLength(0)
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.keyDown(input, { key: 'Enter' })
  await waitFor(() =>
    expect(state.navigate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: '/household/$householdId/investments/$investmentId',
        params: { householdId: 'household', investmentId: 'holding1' },
      }),
    ),
  )
  expect(state.navigate.mock.calls[0][0]).toEqual(
    expect.objectContaining({ replace: true, resetScroll: false }),
  )
  expect(state.load.mock.calls[0][2]).toEqual({
    householdId: 'household',
    viewUserIds: ['owner'],
  })
})

it('loads again after reopening and closes with Escape without changing scroll', async () => {
  const { rerender } = render(<CommandMenu />)
  await screen.findByRole('option', { name: /^Brokerage/ })
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
  await waitFor(() =>
    expect(state.navigate).toHaveBeenCalledWith(
      expect.objectContaining({ replace: true, resetScroll: false }),
    ),
  )
  state.isOpen = false
  rerender(<CommandMenu />)
  state.isOpen = true
  rerender(<CommandMenu />)
  await waitFor(() => expect(state.load).toHaveBeenCalledTimes(2))
})

it('shows a useful empty state and retains the loading input while results are pending', async () => {
  let resolve!: (result: typeof data) => void
  state.load.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done
    }),
  )
  render(<CommandMenu />)
  expect(screen.getByRole('combobox')).toBeTruthy()
  expect(screen.queryAllByRole('option')).toHaveLength(0)
  await act(async () => resolve(data))
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'no such investment' },
  })
  await screen.findByText('No matching accounts, investments, or commands.')
})

it('shows account and owner identity and opens the selected account directly', async () => {
  render(<CommandMenu />)
  const option = await screen.findByRole('option', { name: /^Brokerage/ })
  expect(within(option).getByRole('img', { name: 'Brokerage' })).toBeTruthy()
  expect(within(option).getByRole('img', { name: 'Joey' })).toBeTruthy()
  fireEvent.click(option)
  await waitFor(() =>
    expect(state.navigate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: '/household/$householdId/accounts/$accountId',
        params: { householdId: 'household', accountId: 'account1' },
      }),
    ),
  )
})
