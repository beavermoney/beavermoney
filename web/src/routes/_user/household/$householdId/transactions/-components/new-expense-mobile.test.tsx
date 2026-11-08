// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { NewBuy } from './new-buy'
import { NewSell } from './new-sell'
import { NewMove } from './new-move'
import { NewExpense } from './new-expense'
import { NewTransfer } from './new-transfer'

const mocks = vi.hoisted(() => ({
  close: vi.fn(),
  commit: vi.fn(),
  toast: vi.fn(),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }))
vi.mock('@/hooks/use-log-transaction', () => ({
  useLogTransaction: () => ({
    close: mocks.close,
    defaults: undefined,
    setDefaults: vi.fn(),
  }),
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { id: 'household', locale: 'en-US' } }),
}))
vi.mock('@/hooks/use-user', () => ({
  useUser: () => ({ user: { id: 'joey' } }),
}))
vi.mock('@/hooks/use-household-members', () => ({
  useHouseholdMembers: () => [
    { id: 'joey', name: 'Joey', isSynthetic: false },
    { id: 'partner', name: 'Partner', isSynthetic: false },
  ],
}))
vi.mock('@/hooks/use-default-owner-user-id', () => ({
  useDefaultOwnerUserID: () => 'joey',
}))
vi.mock('@/hooks/use-display-currency', () => ({
  useDisplayCurrency: () => ({ displayCurrencyCode: 'USD' }),
}))
vi.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({ formatCurrencyWithPrivacyMode: () => '$100' }),
}))
vi.mock('@/lib/logo', () => ({
  getLogoDomainURL: () => undefined,
  getLogoTickerURL: () => undefined,
  getLogoCryptoURL: () => undefined,
}))
vi.mock('@/components/category-icon', () => ({ CategoryIcon: () => null }))
vi.mock('@astryxdesign/core/Toast', () => ({ useToast: () => mocks.toast }))
vi.mock('@/lib/relay', () => ({
  commitMutationResult: (...args: unknown[]) => mocks.commit(...args),
}))
vi.mock('react-relay', async (original) => ({
  ...(await original<typeof import('react-relay')>()),
  useFragment: (_: unknown, data: unknown) => data,
  useMutation: () => [vi.fn(), false],
}))
vi.mock('relay-runtime', async (original) => ({
  ...(await original<typeof import('relay-runtime')>()),
  readInlineData: (_: unknown, data: unknown) => data,
}))

const fixture = {
  accounts: {
    edges: [
      {
        node: {
          id: 'account',
          name: 'Checking',
          type: 'liquidity',
          balance: '100',
          icon: null,
          latestTransaction: null,
          householdCurrency: { code: 'USD' },
        },
      },
    ],
  },
  transactionCategories: {
    edges: [
      { node: { id: 'food', name: 'Food', type: 'expense', icon: null } },
    ],
  },
}
const success = {
  status: 'success',
  data: { createExpense: { node: { id: 'saved' } } },
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.commit.mockResolvedValue(success)
})
afterEach(cleanup)

async function enter() {
  render(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  await screen.findByRole('button', { name: 'Account: Checking' })
  fireEvent.click(await screen.findByRole('button', { name: '2' }))
  fireEvent.click(screen.getByRole('button', { name: 'Add amount' }))
  fireEvent.click(screen.getByRole('button', { name: '3' }))
}

it('saves the live calculation once and closes only after confirmed success', async () => {
  let finish!: (value: typeof success) => void
  mocks.commit.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(
    mocks.commit.mock.calls[0][1].variables.input.transactionEntry,
  ).toEqual({ amount: '-5.00', accountID: 'account' })
  expect(mocks.close).not.toHaveBeenCalled()
  expect(
    (screen.getByRole('button', { name: 'Save again' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true)
  finish(success)
  await waitFor(() => expect(mocks.close).toHaveBeenCalledTimes(1))
})

it('Save again clears the amount, keeps the composer open, and retains the account', async () => {
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  await screen.findByRole('button', { name: 'Edit Amount: $0' })
  expect(mocks.close).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Account: Checking' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '4' }))
  expect(screen.getByRole('button', { name: 'Edit Amount: $4' })).toBeTruthy()
})

it('keeps values and the composer open when saving fails', async () => {
  mocks.commit.mockResolvedValue({
    status: 'error',
    error: new Error('Offline'),
  })
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' }),
    ),
  )
  expect(mocks.close).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Edit Amount: $5' })).toBeTruthy()
})

it('shows validation instead of submitting an incomplete entry', async () => {
  render(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Save' }))
  await screen.findByText('Check the highlighted fields before saving.')
  expect(mocks.commit).not.toHaveBeenCalled()
  expect(mocks.close).not.toHaveBeenCalled()
})

it('uses separate source and destination amounts only for different currencies', async () => {
  mocks.commit.mockResolvedValue({
    status: 'success',
    data: { createTransfer: { node: { id: 'saved' } } },
  })
  const account = fixture.accounts.edges[0].node
  const transfer = {
    accounts: {
      edges: [
        { node: account },
        {
          node: {
            ...account,
            id: 'cad',
            name: 'Canadian account',
            householdCurrency: { code: 'CAD' },
          },
        },
        { node: { ...account, id: 'usd', name: 'Other USD account' } },
      ],
    },
    transactionCategories: {
      edges: [
        {
          node: {
            id: 'transfer',
            name: 'Money transfer',
            type: 'transfer',
            icon: null,
          },
        },
      ],
    },
  }
  render(<NewTransfer fragmentRef={transfer as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Money transfer' }))
  await screen.findByRole('button', { name: 'From Account: Checking' })
  fireEvent.click(
    await screen.findByRole('button', { name: 'To Account: Canadian account' }),
  )
  fireEvent.click(
    await screen.findByRole('button', { name: /Other USD account/ }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(
    within(screen.getByRole('group', { name: 'From' })).getByRole('button', {
      name: /Edit Amount/,
    }),
  ).toBeTruthy()
  expect(
    within(screen.getByRole('group', { name: 'To' })).queryByRole('button', {
      name: /Edit .*Amount/,
    }),
  ).toBeNull()
  expect(
    screen.queryByRole('button', { name: /Edit Credit Amount/ }),
  ).toBeNull()
  fireEvent.click(
    screen.getByRole('button', { name: 'To Account: Other USD account' }),
  )
  fireEvent.click(
    await screen.findByRole('button', { name: /Canadian account/ }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(await screen.findByRole('button', { name: '2' }))
  fireEvent.click(
    within(screen.getByRole('group', { name: 'To' })).getByRole('button', {
      name: /Edit Credit Amount/,
    }),
  )
  fireEvent.click(screen.getByRole('button', { name: '3' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(
    mocks.commit.mock.calls[0][1].variables.input.transactionEntries,
  ).toEqual([
    { accountID: 'account', amount: '-2.00' },
    { accountID: 'cad', amount: '3.00' },
  ])
})

it('shows the calculation inside the amount display and clears it with equals', async () => {
  await enter()
  const amount = screen.getByRole('button', { name: 'Edit Amount: $5' })
  expect(amount.textContent).toContain('2 + 3')
  fireEvent.click(screen.getByRole('button', { name: 'Equals' }))
  expect(amount.textContent).not.toContain('2 + 3')
  expect(screen.getByRole('button', { name: 'Edit Amount: $5' })).toBeTruthy()
})

it('defaults to the most recent account and preserves an explicit choice', async () => {
  const account = fixture.accounts.edges[0].node
  render(
    <NewExpense
      fragmentRef={
        {
          ...fixture,
          accounts: {
            edges: [
              { node: account },
              {
                node: {
                  ...account,
                  id: 'recent',
                  name: 'Recent account',
                  latestTransaction: { datetime: '2026-11-08T12:00:00Z' },
                },
              },
            ],
          },
        } as never
      }
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'Account: Recent account' }),
  )
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Checking.*liquidity/ }))
  expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Edit Amount/ })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'Account: Checking' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.getByRole('button', { name: 'Account: Checking' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
})

it('leaves the account unselected when none are eligible', async () => {
  render(
    <NewExpense
      fragmentRef={{ ...fixture, accounts: { edges: [] } } as never}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'Account: Choose' }),
  )
  expect(screen.getByText('No matching options.')).toBeTruthy()
  expect(mocks.commit).not.toHaveBeenCalled()
})

it('shows search for a small account list and replaces the entire composer', async () => {
  render(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'Account: Checking' }),
  )
  const search = screen.getByRole('textbox', { name: 'Search account' })
  expect(screen.queryByRole('button', { name: /Edit Amount/ })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Owner: Joey' })).toBeNull()
  fireEvent.change(search, { target: { value: 'missing' } })
  expect(screen.getByText('No matching options.')).toBeTruthy()
  fireEvent.change(search, { target: { value: 'checking' } })
  fireEvent.click(screen.getByRole('button', { name: /Checking.*liquidity/ }))
  expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Edit Amount/ })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.getByRole('button', { name: 'Edit Amount: $0' })).toBeTruthy()
})

const investmentFixture = {
  accounts: {
    edges: [
      {
        node: {
          ...fixture.accounts.edges[0].node,
          id: 'broker',
          name: 'Brokerage',
          type: 'investment',
          investments: [
            {
              id: 'apple',
              name: 'Apple',
              symbol: 'AAPL',
              latestTransaction: null,
            },
          ],
        },
      },
      {
        node: {
          ...fixture.accounts.edges[0].node,
          id: 'retirement',
          name: 'Retirement',
          type: 'investment',
          investments: [
            {
              id: 'fund',
              name: 'Index fund',
              symbol: 'VTI',
              latestTransaction: null,
            },
            {
              id: 'apple-retirement',
              name: 'Apple retirement',
              symbol: 'AAPL',
              latestTransaction: null,
            },
          ],
        },
      },
    ],
  },
  transactionCategories: {
    edges: ['Buy', 'Sell', 'Move'].map((name) => ({
      node: { id: name.toLowerCase(), name, type: 'investment' },
    })),
  },
}

it.each([
  ['Buy', NewBuy],
  ['Sell', NewSell],
  ['Move', NewMove],
] as const)(
  '%s starts with accounts, filters investments, and only then opens the drawer',
  async (kind, Component) => {
    render(<Component fragmentRef={investmentFixture as never} />)
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
    fireEvent.change(screen.getByRole('textbox', { name: 'Search accounts' }), {
      target: { value: 'Broker' },
    })
    expect(screen.queryByText('Retirement')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: /Brokerage.*investment/ }),
    )
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
    expect(screen.queryByText('Index fund')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Apple.*AAPL/ }))
    if (kind === 'Move') {
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
      expect(
        screen.queryByRole('button', { name: /Brokerage.*investment/ }),
      ).toBeNull()
      fireEvent.click(
        screen.getByRole('button', { name: /Retirement.*investment/ }),
      )
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
      expect(screen.queryByText('Index fund')).toBeNull()
      fireEvent.click(
        screen.getByRole('button', { name: /Apple retirement.*AAPL/ }),
      )
    }
    await screen.findByRole('button', { name: 'Save' })
    expect(screen.getByText(kind)).toBeTruthy()
    const shares = screen.getByRole('button', { name: /Edit Shares:/ })
    const price = screen.getByRole('button', { name: /Edit Price per share:/i })
    fireEvent.click(price)
    expect(
      shares.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(price.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(
      screen.getByRole('button', { name: /Edit Price per share:.*2/i }),
    ).toBeTruthy()
  },
)
