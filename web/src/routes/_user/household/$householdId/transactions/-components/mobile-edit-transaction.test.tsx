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
import { MobileEditTransaction } from './mobile-edit-transaction'

const mocks = vi.hoisted(() => ({
  commit: vi.fn(),
  close: vi.fn(),
  remove: vi.fn(),
  pending: vi.fn(),
  privacy: false,
}))
vi.mock('@/hooks/use-privacy-mode', () => ({
  usePrivacyMode: () => ({ isPrivacyModeEnabled: mocks.privacy }),
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { locale: 'en-US' } }),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }))
vi.mock('@/lib/logo', () => ({
  getLogoDomainURL: () => undefined,
  getLogoTickerURL: () => undefined,
  getLogoCryptoURL: () => undefined,
}))
vi.mock('@/components/category-icon', () => ({ CategoryIcon: () => null }))
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
const account = {
  id: 'checking',
  name: 'Checking',
  icon: null,
  type: 'liquidity',
  archived: false,
  householdCurrency: { code: 'USD' },
  investments: [],
}
const savings = { ...account, id: 'savings', name: 'Savings' }
const category = { id: 'food', name: 'Food', type: 'expense', icon: null }
const fixture = {
  id: 'transaction',
  description: 'Lunch',
  datetime: '2026-11-01T12:00:00Z',
  excludeFromReports: true,
  pending: false,
  user: { name: 'Joey' },
  category,
  transactionEntries: [{ id: 'entry', amount: '-20.63', account }],
  investmentLots: [],
}
function open(
  transaction: unknown = fixture,
  accounts: unknown[] = [account, savings],
  desktop = false,
) {
  return render(
    <MobileEditTransaction
      desktop={desktop}
      transactionRef={transaction as never}
      householdRef={
        { accounts: { edges: accounts.map((node) => ({ node })) } } as never
      }
      categories={[category] as never}
      deleting={false}
      onClose={mocks.close}
      onDelete={mocks.remove}
      onPendingChange={mocks.pending}
    />,
  )
}
const variables = () => mocks.commit.mock.calls[0][1].variables
beforeEach(() => {
  vi.clearAllMocks()
  mocks.privacy = false
  mocks.commit.mockResolvedValue({ status: 'success', data: {} })
})
afterEach(cleanup)

it('prefills the composer, has one Save, and closes only after the confirmed edit', async () => {
  let finish!: (result: unknown) => void
  mocks.commit.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  open()
  expect(
    screen.getByRole('button', { name: 'Edit Amount: $20.63' }),
  ).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Save again' })).toBeNull()
  expect(
    screen
      .getByRole('button', { name: 'Owner: Joey' })
      .getAttribute('aria-disabled'),
  ).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Delete last digit' }))
  fireEvent.click(screen.getByRole('button', { name: '4' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    id: 'transaction',
    entry0: 'entry',
    editEntry0: true,
    entry0Input: { amount: '-20.64' },
    editEntry1: false,
    editLot0: false,
    input: {
      description: 'Lunch',
      excludeFromReports: true,
      categoryID: 'food',
      datetime: fixture.datetime.replace('Z', '.000Z'),
    },
  })
  expect(mocks.close).not.toHaveBeenCalled()
  expect(mocks.pending).toHaveBeenLastCalledWith(true)
  finish({ status: 'success', data: {} })
  await waitFor(() => expect(mocks.close).toHaveBeenCalledTimes(1))
})

it('keeps the draft open after a failed save', async () => {
  mocks.commit.mockResolvedValue({
    status: 'error',
    error: new Error('offline'),
  })
  open()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await screen.findByText(
    'Could not save. Your entry is still here—please try again.',
  )
  expect(
    screen.getByRole('button', { name: 'Edit Amount: $20.63' }),
  ).toBeTruthy()
  expect(mocks.close).not.toHaveBeenCalled()
})

it('saves both sides of a same-currency transfer in one operation', async () => {
  open({
    ...fixture,
    category: { ...category, type: 'transfer', name: 'Money Transfer' },
    transactionEntries: [
      { id: 'debit', amount: '-25', account },
      { id: 'credit', amount: '25', account: savings },
    ],
  })
  expect(
    screen.getAllByRole('button', { name: /Edit .*Amount/i }),
  ).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Delete last digit' }))
  fireEvent.click(screen.getByRole('button', { name: '6' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    editEntry0: true,
    editEntry1: true,
    entry0Input: { amount: '-26' },
    entry1Input: { amount: '26' },
  })
})

it('preserves independent FX amounts and their signs', async () => {
  const cad = { ...savings, householdCurrency: { code: 'CAD' } }
  open(
    {
      ...fixture,
      category: { ...category, type: 'transfer' },
      transactionEntries: [
        { id: 'debit', amount: '-25', account },
        { id: 'credit', amount: '35', account: cad },
      ],
    },
    [account, cad],
  )
  expect(
    within(screen.getByRole('group', { name: 'To' })).getByRole('button', {
      name: 'Edit To amount: CA$35',
    }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Delete last digit' }))
  fireEvent.click(screen.getByRole('button', { name: '6' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    entry0Input: { amount: '-26' },
    entry1Input: { amount: '35' },
    editEntry1: false,
  })
})

it('preserves archived accounts and exact share precision on metadata-only edits', async () => {
  const archived = {
    ...account,
    archived: true,
    type: 'investment',
    investments: [{ id: 'investment', name: 'Stock', symbol: 'STK' }],
  }
  open(
    {
      ...fixture,
      transactionEntries: [],
      investmentLots: [
        {
          id: 'lot',
          amount: '-0.123456789123456789',
          price: '1.23456789123456789',
          investment: { ...archived.investments[0], account: archived },
        },
      ],
    },
    [],
  )
  expect(
    screen.getByRole('button', { name: 'Investment account: Checking' }),
  ).toBeTruthy()
  expect(
    screen.getByRole('button', { name: 'Edit Shares: 0.123456789123456789' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    editEntry0: false,
    editLot0: false,
    lot0Input: {
      amount: '-0.123456789123456789',
      price: '1.23456789123456789',
    },
  })
})

it('requires Done after account selection and can clear an existing note', async () => {
  open()
  fireEvent.click(screen.getByRole('button', { name: 'Account: Checking' }))
  fireEvent.click(screen.getByRole('button', { name: /Savings.*Liquidity/ }))
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(
    screen.getByRole('button', { name: /^(Lunch|Changed note)$/ }),
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), {
    target: { value: '' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    entry0Input: { amount: '-20.63', accountID: 'savings' },
    input: { clearDescription: true, description: null },
  })
})

it('requires explicit deletion confirmation and keeps drafts when cancelled', () => {
  open()
  fireEvent.click(
    screen.getByRole('button', { name: /^(Lunch|Changed note)$/ }),
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), {
    target: { value: 'Changed note' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }))
  expect(mocks.remove).not.toHaveBeenCalled()
  const confirmation = screen.getByRole('alertdialog', {
    name: 'Delete transaction?',
  })
  expect(within(confirmation).queryByRole('textbox')).toBeNull()
  expect(
    within(confirmation).queryByRole('button', { name: 'Done' }),
  ).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(
    screen.getByRole('button', { name: /^(Lunch|Changed note)$/ }),
  )
  expect(
    (screen.getByRole('textbox', { name: 'Note' }) as HTMLInputElement).value,
  ).toBe('Changed note')
})

it('keeps investment account and symbol disabled while editing amounts in a fixed order', async () => {
  const broker = {
    ...account,
    id: 'broker',
    name: 'Brokerage',
    type: 'investment',
  }
  open(
    {
      ...fixture,
      category: { ...category, name: 'Buy', type: 'investment' },
      transactionEntries: [{ id: 'entry', amount: '-100', account: broker }],
      investmentLots: [
        {
          id: 'lot',
          amount: '2',
          price: '50',
          investment: {
            id: 'apple',
            name: 'Apple',
            symbol: 'AAPL',
            account: broker,
          },
        },
      ],
    },
    [broker],
  )
  for (const name of ['Investment account: Brokerage', 'Investment: AAPL']) {
    const button = screen.getByRole('button', { name }) as HTMLButtonElement
    expect(
      button.disabled || button.getAttribute('aria-disabled') === 'true',
    ).toBe(true)
  }
  const shares = screen.getByRole('button', { name: /Edit Shares:/ })
  const price = screen.getByRole('button', { name: /Edit Price per share:/ })
  const total = screen.getByRole('button', { name: /Edit Total paid:/ })
  fireEvent.click(total)
  expect(
    shares.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(
    price.compareDocumentPosition(total) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables().entry0Input.accountID).toBeUndefined()
  expect(variables().lot0Input.investmentID).toBeUndefined()
})

it('offers Delete beside Save and only deletes after confirmation', () => {
  open()
  expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }))
  expect(mocks.remove).not.toHaveBeenCalled()
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Delete transaction',
    }),
  )
  expect(mocks.remove).toHaveBeenCalledTimes(1)
})

it('prevents repeat deletion while pending and lets a failed deletion be retried', async () => {
  let rejectDelete!: (reason: Error) => void
  mocks.remove.mockImplementationOnce(
    () =>
      new Promise<void>((_, reject) => {
        rejectDelete = reject
      }),
  )
  open()
  fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }))
  const confirmation = screen.getByRole('alertdialog')
  const remove = within(confirmation).getByRole('button', {
    name: 'Delete transaction',
  })
  fireEvent.click(remove)
  fireEvent.click(remove)
  expect(mocks.remove).toHaveBeenCalledTimes(1)
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Cancel' }))
  expect(screen.getByRole('alertdialog')).toBeTruthy()
  rejectDelete(new Error('Offline'))
  await screen.findByText(
    'Could not delete this transaction. Please try again.',
  )
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Delete transaction',
    }),
  )
  await waitFor(() => expect(mocks.remove).toHaveBeenCalledTimes(2))
})

it('keeps note and options separate, shows all selections, and clears pending on save', async () => {
  open({ ...fixture, pending: true })
  expect(screen.getByRole('button', { name: 'Lunch' })).toBeTruthy()
  fireEvent.click(
    screen.getByRole('button', { name: 'Pending · Exclude from reports' }),
  )
  expect(screen.queryByRole('textbox', { name: 'Note' })).toBeNull()
  const pending = screen.getByRole('checkbox', {
    name: 'Pending',
  }) as HTMLInputElement
  expect(pending.checked).toBe(true)
  fireEvent.click(pending)
  fireEvent.click(
    screen.getByRole('checkbox', { name: 'Exclude from reports' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.getByRole('button', { name: 'Options' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Lunch' }))
  expect(
    (screen.getByRole('textbox', { name: 'Note' }) as HTMLInputElement).value,
  ).toBe('Lunch')
  expect(screen.queryByRole('checkbox', { name: 'Pending' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables().input).toMatchObject({
    pending: false,
    excludeFromReports: false,
    description: 'Lunch',
  })
})

it('sets pending without changing the report option or amount', async () => {
  open({ ...fixture, excludeFromReports: false })
  fireEvent.click(screen.getByRole('button', { name: 'Options' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Pending' }))
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.getByRole('button', { name: 'Pending' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables().input).toMatchObject({
    pending: true,
    excludeFromReports: false,
  })
  expect(variables().entry0Input.amount).toBe('-20.63')
})

it('prefills the shared desktop form and updates the existing transaction atomically', async () => {
  open(fixture, [account, savings], true)
  expect(
    (screen.getByRole('textbox', { name: /^Amount/ }) as HTMLInputElement)
      .value,
  ).toBe('20.63')
  expect(
    (screen.getByRole('textbox', { name: 'Note' }) as HTMLInputElement).value,
  ).toBe('Lunch')
  fireEvent.change(screen.getByRole('textbox', { name: /^Amount/ }), {
    target: { value: '21.75' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), {
    target: { value: '' },
  })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Pending' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    id: 'transaction',
    entry0: 'entry',
    editEntry0: true,
    entry0Input: { amount: '-21.75' },
    input: {
      pending: true,
      clearDescription: true,
      description: null,
      excludeFromReports: true,
    },
  })
  expect(mocks.close).toHaveBeenCalledTimes(1)
})

it('preserves exact investment values when saving only desktop metadata', async () => {
  const investmentAccount = { ...account, type: 'investment', archived: true }
  open(
    {
      ...fixture,
      transactionEntries: [],
      investmentLots: [
        {
          id: 'lot',
          amount: '-0.123456789123456789',
          price: '1.23456789123456789',
          investment: {
            id: 'stock',
            name: 'Stock',
            symbol: 'STK',
            type: 'stock',
            account: investmentAccount,
          },
        },
      ],
    },
    [],
    true,
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), {
    target: { value: 'Review later' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
  await waitFor(() => expect(mocks.commit).toHaveBeenCalledTimes(1))
  expect(variables()).toMatchObject({
    editEntry0: false,
    editLot0: false,
    lot0Input: {
      amount: '-0.123456789123456789',
      price: '1.23456789123456789',
    },
    input: { description: 'Review later' },
  })
})

it('keeps desktop edits open after a failed update and cancels without writing', async () => {
  mocks.commit.mockResolvedValue({
    status: 'error',
    error: new Error('offline'),
  })
  open(fixture, [account], true)
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
  await screen.findByText('offline')
  expect(mocks.close).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(mocks.close).toHaveBeenCalledTimes(1)
  expect(mocks.commit).toHaveBeenCalledTimes(1)
})

it('shows each selected account balance on mobile transfer cards', () => {
  const from = { ...account, balance: '1000.00' }
  const to = { ...savings, balance: '250.00' }
  open(
    {
      ...fixture,
      category: { ...category, type: 'transfer' },
      transactionEntries: [
        { id: 'debit', amount: '-25', account: from },
        { id: 'credit', amount: '25', account: to },
      ],
    },
    [from, to],
  )
  expect(
    within(screen.getByRole('group', { name: 'From' })).getByText(
      'Balance: $1,000.00',
    ),
  ).toBeTruthy()
  expect(
    within(screen.getByRole('group', { name: 'To' })).getByText(
      'Balance: $250.00',
    ),
  ).toBeTruthy()
})

it('masks transfer account balances when privacy mode is enabled', () => {
  mocks.privacy = true
  const from = { ...account, balance: '1000.00' }
  const to = { ...savings, balance: '250.00' }
  open(
    {
      ...fixture,
      category: { ...category, type: 'transfer' },
      transactionEntries: [
        { id: 'debit', amount: '-25', account: from },
        { id: 'credit', amount: '25', account: to },
      ],
    },
    [from, to],
  )
  expect(screen.getAllByText('Balance: •••••••')).toHaveLength(2)
  expect(screen.queryByText('Balance: $1,000.00')).toBeNull()
})
