import { activateLocale } from '@/lib/i18n'
// @vitest-environment jsdom
import '@/test/browser-setup'
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
import { deliverTransactionDefaults } from '@/hooks/log-transaction-store'
import { NewBuy } from './new-buy'
import { NewSell } from './new-sell'
import { NewMove } from './new-move'
import { NewExpense } from './new-expense'
import { NewIncome } from './new-income'
import { NewTransfer } from './new-transfer'

const mocks = vi.hoisted(() => ({
  mobile: true,
  privacy: false,
  close: vi.fn(),
  defaults: undefined as { accountId: string } | undefined,
  environment: {},
  search: vi.fn(),
  commit: vi.fn(),
  toast: vi.fn(),
}))
vi.mock('@/env', () => ({ env: { VITE_SERVER_URL: 'http://localhost' } }))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: mocks.privacy }),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mocks.mobile }))
vi.mock('@/hooks/use-log-transaction', () => ({
  useLogTransaction: () => ({
    close: mocks.close,
    defaults: mocks.defaults,
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
  useRelayEnvironment: () => mocks.environment,
  fetchQuery: (
    _environment: unknown,
    _query: unknown,
    variables: { query: string },
  ) => ({ toPromise: () => mocks.search(variables.query) }),
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
  mocks.mobile = true
  mocks.privacy = false
  mocks.defaults = undefined
  vi.clearAllMocks()
  mocks.search.mockImplementation(async (query: string) => ({
    household: {
      merchantSearch: [{ id: 'cafe', name: 'Corner Cafe', icon: null }].filter(
        (item) => item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    },
  }))
  mocks.commit.mockResolvedValue(success)
})
afterEach(cleanup)

async function enter() {
  const view = render(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  await screen.findByRole('button', { name: 'Account: Checking' })
  fireEvent.click(await screen.findByRole('button', { name: '2' }))
  fireEvent.click(screen.getByRole('button', { name: 'Add amount' }))
  fireEvent.click(screen.getByRole('button', { name: '3' }))
  return view
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

it('Save again retains account, category, owner and date while resetting other fields for the next save', async () => {
  const view = await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Owner: Joey' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Partner' }))
  expect(screen.getByRole('button', { name: 'Owner: Partner' })).toBeTruthy()
  const today = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date())
  fireEvent.click(screen.getByRole('button', { name: today }))
  fireEvent.click(await screen.findByRole('button', { name: 'Yesterday' }))
  fireEvent.click(
    screen.getByRole('button', { name: /^(Note|Keep this draft)$/ }),
  )
  fireEvent.change(await screen.findByRole('textbox', { name: 'Note' }), {
    target: { value: 'Previous entry' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: 'Options' }))
  expect(screen.queryByRole('textbox', { name: 'Note' })).toBeNull()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Pending' }))
  fireEvent.click(
    screen.getByRole('checkbox', { name: 'Exclude from reports' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  await screen.findByRole('button', { name: 'Edit Amount: $0' })
  expect(mocks.close).not.toHaveBeenCalled()
  // Relay refreshes household data after saving.
  view.rerender(<NewExpense fragmentRef={{ ...fixture } as never} />)
  expect(screen.getByRole('button', { name: 'Account: Checking' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '4' }))
  expect(screen.getByRole('button', { name: 'Edit Amount: $4' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(2))
  expect(
    mocks.commit.mock.calls[1][1].variables.input.transaction.datetime,
  ).toBe(mocks.commit.mock.calls[0][1].variables.input.transaction.datetime)
  expect(
    mocks.commit.mock.calls[0][1].variables.input.transaction,
  ).toMatchObject({
    description: 'Previous entry',
    pending: true,
    excludeFromReports: true,
    userID: 'partner',
  })
  expect(mocks.commit.mock.calls[1][1].variables.input).toMatchObject({
    transaction: {
      description: '',
      categoryID: 'food',
      userID: 'partner',
      excludeFromReports: false,
    },
    transactionEntry: { amount: '-4.00', accountID: 'account' },
  })
  await screen.findByRole('button', { name: 'Edit Amount: $0' })
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
  fireEvent.click(screen.getByRole('button', { name: /Checking.*Liquidity/ }))
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

it('opens account search within the composer and returns to the numpad', async () => {
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
  fireEvent.click(screen.getByRole('button', { name: /Checking.*Liquidity/ }))
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
              amount: '12.3456789',
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
              amount: '0',
              name: 'Index fund',
              symbol: 'VTI',
              latestTransaction: null,
            },
            {
              id: 'apple-retirement',
              amount: '7.25',
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
  ['Buy', NewBuy, 'en'],
  ['Buy', NewBuy, 'zh-CN'],
  ['Sell', NewSell, 'en'],
  ['Sell', NewSell, 'zh-CN'],
  ['Move', NewMove, 'en'],
  ['Move', NewMove, 'zh-CN'],
] as const)(
  '%s completes investment selection in both languages',
  async (kind, Component, locale) => {
    activateLocale(locale, false)
    const chinese = locale === 'zh-CN'
    const save = chinese ? '保存' : 'Save'
    render(<Component fragmentRef={investmentFixture as never} />)
    expect(screen.queryByRole('button', { name: save })).toBeNull()
    fireEvent.change(
      screen.getByRole('textbox', {
        name: chinese ? '搜索账户' : 'Search accounts',
      }),
      {
        target: { value: 'Broker' },
      },
    )
    expect(screen.queryByText('Retirement')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', {
        name: chinese ? /Brokerage.*投资/ : /Brokerage.*Investment/,
      }),
    )
    expect(screen.queryByRole('button', { name: save })).toBeNull()
    expect(screen.queryByText('Index fund')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Apple.*AAPL/ }))
    if (kind === 'Move') {
      expect(screen.queryByRole('button', { name: save })).toBeNull()
      expect(
        screen.queryByRole('button', {
          name: chinese ? /Brokerage.*投资/ : /Brokerage.*Investment/,
        }),
      ).toBeNull()
      fireEvent.click(
        screen.getByRole('button', {
          name: chinese ? /Retirement.*投资/ : /Retirement.*Investment/,
        }),
      )
      expect(screen.queryByRole('button', { name: save })).toBeNull()
      expect(screen.queryByText('Index fund')).toBeNull()
      fireEvent.click(
        screen.getByRole('button', { name: /Apple retirement.*AAPL/ }),
      )
    }
    await screen.findByRole('button', { name: save })
    expect(
      screen.getByText(
        chinese ? { Buy: '买入', Sell: '卖出', Move: '转移' }[kind] : kind,
      ),
    ).toBeTruthy()
    const shares = screen.getByRole('button', {
      name: chinese ? /编辑股数：/ : /Edit Shares:/,
    })
    if (kind === 'Move') {
      expect(
        screen.queryByRole('button', {
          name: chinese ? /编辑每股价格：/ : /Edit Price per share:/i,
        }),
      ).toBeNull()
      fireEvent.click(shares)
      fireEvent.click(screen.getByRole('button', { name: '2' }))
      expect(
        screen.getByRole('button', {
          name: chinese ? /编辑股数：.*2/ : /Edit Shares:.*2/,
        }),
      ).toBeTruthy()
      return
    }
    const price = screen.getByRole('button', {
      name: chinese ? /编辑每股价格：/ : /Edit Price per share:/i,
    })
    fireEvent.click(price)
    expect(
      shares.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(price.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(
      screen.getByRole('button', {
        name: chinese ? /编辑每股价格：.*2/ : /Edit Price per share:.*2/i,
      }),
    ).toBeTruthy()
  },
)

it('keeps the draft but clears a removed account before submission', async () => {
  const view = render(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  fireEvent.click(await screen.findByRole('button', { name: '2' }))
  fireEvent.click(
    screen.getByRole('button', { name: /^(Note|Keep this draft)$/ }),
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), {
    target: { value: 'Keep this draft' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  view.rerender(
    <NewExpense
      fragmentRef={{ ...fixture, accounts: { edges: [] } } as never}
    />,
  )
  expect(screen.queryByRole('button', { name: 'Account: Checking' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await screen.findByRole('alert')
  expect(mocks.commit).not.toHaveBeenCalled()
  fireEvent.click(
    screen.getByRole('button', { name: /^(Note|Keep this draft)$/ }),
  )
  expect(
    (screen.getByRole('textbox', { name: 'Note' }) as HTMLInputElement).value,
  ).toBe('Keep this draft')
})

it.each([
  ['Buy', NewBuy, 'Total paid'],
  ['Sell', NewSell, 'Total received'],
] as const)(
  '%s calculates the editable total when either quantity input changes',
  async (_kind, Component, total) => {
    render(<Component fragmentRef={investmentFixture as never} />)
    fireEvent.click(
      screen.getByRole('button', { name: /Brokerage.*Investment/ }),
    )
    fireEvent.click(screen.getByRole('button', { name: /Apple.*AAPL/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Edit Shares:/ }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(
      screen.getByRole('button', { name: /Edit Price per share:/i }),
    )
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    await screen.findByRole('button', {
      name: new RegExp(`Edit ${total}:.*6`, 'i'),
    })
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    await screen.findByRole('button', {
      name: new RegExp(`Edit ${total}:.*68`, 'i'),
    })
  },
)

it('retains an explicit initial account after consuming defaults, and applies later account actions without erasing the draft', async () => {
  const accounts = [
    fixture.accounts.edges[0],
    {
      node: {
        ...fixture.accounts.edges[0].node,
        id: 'other',
        name: 'Other account',
      },
    },
  ]
  const data = { ...fixture, accounts: { edges: accounts } }
  mocks.defaults = { accountId: 'other' }
  const view = render(<NewExpense fragmentRef={data as never} />)
  mocks.defaults = undefined
  view.rerender(<NewExpense fragmentRef={data as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  await screen.findByRole('button', { name: 'Account: Other account' })
  fireEvent.click(screen.getByRole('button', { name: '2' }))
  act(() => deliverTransactionDefaults('expense', { accountId: 'account' }))
  await screen.findByRole('button', { name: 'Account: Checking' })
  expect(screen.getByRole('button', { name: 'Edit Amount: $2' })).toBeTruthy()
  view.unmount()
  // A closed form must not consume future defaults.
  act(() => deliverTransactionDefaults('expense', { accountId: 'other' }))
})

it.each([
  ['Expense', NewExpense],
  ['Income', NewIncome],
  ['Transfer', NewTransfer],
  ['Buy', NewBuy],
  ['Sell', NewSell],
  ['Move', NewMove],
] as const)(
  '%s desktop form starts with Pending off and allows toggling it',
  (_kind, Component) => {
    mocks.mobile = false
    render(<Component fragmentRef={investmentFixture as never} />)
    const pending = screen.getByRole('checkbox', {
      name: 'Pending',
    }) as HTMLInputElement
    expect(pending.checked).toBe(false)
    fireEvent.click(pending)
    expect(pending.checked).toBe(true)
    fireEvent.click(pending)
    expect(pending.checked).toBe(false)
  },
)

it('desktop Save again preserves selections for another entry, then Save closes', async () => {
  const view = await enter()
  mocks.mobile = false
  view.rerender(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(mocks.close).not.toHaveBeenCalled()
  const amount = screen.getByRole('textbox', { name: /^Amount/ })
  await waitFor(() => expect((amount as HTMLInputElement).value).toBe(''))
  view.rerender(<NewExpense fragmentRef={{ ...fixture } as never} />)
  fireEvent.change(amount, { target: { value: '4' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.close).toHaveBeenCalledTimes(1))
  expect(mocks.commit.mock.calls[1][1].variables.input).toMatchObject({
    transaction: {
      categoryID: 'food',
      userID: 'joey',
      datetime:
        mocks.commit.mock.calls[0][1].variables.input.transaction.datetime,
    },
    transactionEntry: { amount: '-4.00', accountID: 'account' },
  })
})

it.each(['Save', 'Save again'])(
  'desktop %s keeps the draft on failure and prevents duplicate submissions',
  async (action) => {
    let finish!: (value: unknown) => void
    mocks.commit.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const view = await enter()
    mocks.mobile = false
    view.rerender(<NewExpense fragmentRef={fixture as never} />)
    fireEvent.click(screen.getByRole('button', { name: action }))
    await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
    finish({ status: 'error', error: new Error('Offline') })
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' }),
      ),
    )
    expect(mocks.commit).toHaveBeenCalledTimes(1)
    expect(mocks.close).not.toHaveBeenCalled()
    expect(
      (screen.getByRole('textbox', { name: /^Amount/ }) as HTMLInputElement)
        .value,
    ).toContain('5')
  },
)

it('mobile Reset clears the draft and returns to category selection without saving', async () => {
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  expect(mocks.commit).not.toHaveBeenCalled()
  fireEvent.click(await screen.findByRole('button', { name: 'Food' }))
  await screen.findByRole('button', { name: 'Edit Amount: $0' })
})

it.each([
  ['Buy', NewBuy, true],
  ['Buy', NewBuy, false],
  ['Sell', NewSell, true],
  ['Sell', NewSell, false],
] as const)(
  '%s keeps availability visible in the selected summary across responsive layouts',
  async (kind, Component, mobile) => {
    const view = render(<Component fragmentRef={investmentFixture as never} />)
    fireEvent.click(
      screen.getByRole('button', { name: /Brokerage.*Investment/ }),
    )
    const holding = screen.getByRole('button', { name: /Apple.*AAPL/ })
    if (kind === 'Sell') {
      expect(holding.textContent).toContain('Shares available: 12.3456789')
    }
    fireEvent.click(holding)
    await screen.findByRole('button', { name: 'Save' })
    mocks.mobile = mobile
    view.rerender(<Component fragmentRef={investmentFixture as never} />)
    expect(
      screen.getByRole('button', {
        name: mobile
          ? kind === 'Buy'
            ? 'Account: Brokerage'
            : 'Investment: Apple'
          : kind === 'Buy'
            ? /Brokerage/
            : /Apple/,
      }).textContent,
    ).toContain(kind === 'Buy' ? '($100 USD)' : '(12.3456789 shares)')
    if (mobile) {
      const selected = screen.getByRole('button', {
        name: kind === 'Buy' ? 'Account: Brokerage' : 'Investment: Apple',
      })
      expect(selected.getAttribute('aria-description')).toBe(
        kind === 'Buy' ? '$100 USD' : '12.3456789 shares',
      )
    }
    if (kind === 'Sell') {
      mocks.privacy = true
      view.rerender(<Component fragmentRef={investmentFixture as never} />)
      expect(
        screen.getByRole('button', {
          name: mobile ? 'Investment: Apple' : /Apple/,
        }).textContent,
      ).toContain('(••• shares)')
      expect(screen.queryByText(/12\.3456789/)).toBeNull()
    }
  },
)

it.each([true, false])(
  'Save again keeps the merchant for the next expense (mobile: %s)',
  async (mobile) => {
    const view = await enter()
    fireEvent.click(screen.getByRole('button', { name: 'Choose merchant' }))
    fireEvent.click(await screen.findByRole('option', { name: /Corner Cafe/ }))
    mocks.mobile = mobile
    view.rerender(<NewExpense fragmentRef={fixture as never} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
    await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
    if (mobile) {
      await screen.findByRole('button', { name: 'Edit Amount: $0' })
      expect(
        screen.getByRole('button', { name: 'Merchant: Corner Cafe' }),
      ).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: '4' }))
    } else {
      const amount = screen.getByRole('textbox', { name: /^Amount/ })
      await waitFor(() => expect((amount as HTMLInputElement).value).toBe(''))
      expect(screen.getAllByText('Corner Cafe').length).toBeGreaterThan(0)
      fireEvent.change(amount, { target: { value: '4' } })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(2))
    for (const call of mocks.commit.mock.calls) {
      expect(call[1].variables.input).toMatchObject({
        merchantID: 'cafe',
        merchantName: undefined,
      })
    }
  },
)

it('preserves a newly entered merchant after Save again', async () => {
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Choose merchant' }))
  fireEvent.change(await screen.findByRole('combobox', { name: /Merchant/ }), {
    target: { value: 'New Bakery' },
  })
  fireEvent.click(
    await screen.findByRole('option', { name: /Add “New Bakery”/ }),
  )
  expect(mocks.commit).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Save again' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(mocks.commit.mock.calls[0][1].variables.input).toMatchObject({
    merchantID: undefined,
    merchantName: 'New Bakery',
  })
  await screen.findByRole('button', { name: 'Edit Amount: $0' })
  expect(
    screen.getByRole('button', { name: 'Merchant: New Bakery' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '4' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(2))
  expect(mocks.commit.mock.calls[1][1].variables.input.merchantName).toBe(
    'New Bakery',
  )
})

it('reset discards a staged merchant without creating it', async () => {
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Choose merchant' }))
  fireEvent.change(await screen.findByRole('combobox', { name: /Merchant/ }), {
    target: { value: 'Unsaved Bakery' },
  })
  fireEvent.click(
    await screen.findByRole('option', { name: /Add “Unsaved Bakery”/ }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  expect(mocks.commit).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Food' }))
  await screen.findByRole('button', { name: 'Choose merchant' })
})

it('desktop merchant autocomplete assigns the selected existing merchant', async () => {
  const view = await enter()
  mocks.mobile = false
  view.rerender(<NewExpense fragmentRef={fixture as never} />)
  fireEvent.focus(screen.getByRole('combobox', { name: /Merchant/ }))
  fireEvent.change(screen.getByRole('combobox', { name: /Merchant/ }), {
    target: { value: 'Corner' },
  })
  fireEvent.click(await screen.findByRole('option', { name: /Corner Cafe/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(mocks.commit.mock.calls[0][1].variables.input.merchantID).toBe('cafe')
})

it('a failed merchant search never offers to create an unknown duplicate', async () => {
  mocks.search.mockRejectedValue(new Error('Offline'))
  await enter()
  fireEvent.click(screen.getByRole('button', { name: 'Choose merchant' }))
  fireEvent.change(await screen.findByRole('combobox', { name: /Merchant/ }), {
    target: { value: 'Corner Cafe' },
  })
  await screen.findByText('Could not load merchants. Type to retry.')
  expect(screen.queryByRole('option', { name: /Add/ })).toBeNull()
  expect(mocks.commit).not.toHaveBeenCalled()
})
