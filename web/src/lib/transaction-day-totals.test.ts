import { expect, it } from 'vitest'
import currency from 'currency.js'
import {
  transactionDayTotals,
  transactionDayTotalsFromFragments,
} from './transaction-day-totals'
const transaction = (
  type: string,
  amount: string,
  code = 'USD',
  user = 'a',
  excluded = false,
) => ({
  category: { type },
  excludeFromReports: excluded,
  transactionEntries: [
    { amount, account: { user: { id: user }, householdCurrency: { code } } },
  ],
})
const convert = (amount: string, code: string) =>
  currency(amount).multiply(code === 'CAD' ? 0.75 : 1)
it('combines currencies, nets refunds, and excludes transfers, trades and excluded entries', () => {
  const result = transactionDayTotals(
    [
      transaction('income', '100'),
      transaction('income', '20', 'CAD'),
      transaction('expense', '-10'),
      transaction('expense', '2'),
      transaction('transfer', '500'),
      transaction('investment', '-200'),
      transaction('expense', '-50', 'USD', 'a', true),
    ],
    convert,
    null,
  )
  expect(result.income.value).toBe(115)
  expect(result.expense.value).toBe(8)
})
it('respects selected household members and exact cent addition', () => {
  const result = transactionDayTotals(
    [
      transaction('expense', '-0.1'),
      transaction('expense', '-0.2'),
      transaction('income', '100', 'USD', 'b'),
    ],
    convert,
    ['a'],
  )
  expect(result.income.value).toBe(0)
  expect(result.expense.value).toBe(0.3)
})

it('reads the inline fragment owned by the daily totals calculation', () => {
  const refs = [
    transaction('expense', '-10'),
    transaction('income', '20', 'CAD'),
  ].map((data) => ({
    __fragments: { transactionDayTotalsFragment: data },
    ' $fragmentSpreads': { transactionDayTotalsFragment: true as const },
  }))
  const totals = transactionDayTotalsFromFragments(refs, convert, ['a'])
  expect(totals.income.value).toBe(15)
  expect(totals.expense.value).toBe(10)
})
