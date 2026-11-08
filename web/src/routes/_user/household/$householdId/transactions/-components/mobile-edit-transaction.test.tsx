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
}))
vi.mock('@/hooks/use-household', () => ({
  useHousehold: () => ({ household: { locale: 'en-US' } }),
}))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }))
vi.mock('@/lib/logo', () => ({ getLogoDomainURL: () => undefined }))
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
  user: { name: 'Joey' },
  category,
  transactionEntries: [{ id: 'entry', amount: '-20.63', account }],
  investmentLots: [],
}
function open(
  transaction: unknown = fixture,
  accounts: unknown[] = [account, savings],
) {
  return render(
    <MobileEditTransaction
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
  fireEvent.click(screen.getByRole('button', { name: /Savings.*liquidity/ }))
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: 'Add note / options' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
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
  fireEvent.click(screen.getByRole('button', { name: 'Add note / options' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
    target: { value: 'Changed note' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }))
  expect(mocks.remove).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel deletion' }))
  expect(
    (screen.getByRole('textbox', { name: 'Description' }) as HTMLInputElement)
      .value,
  ).toBe('Changed note')
})
