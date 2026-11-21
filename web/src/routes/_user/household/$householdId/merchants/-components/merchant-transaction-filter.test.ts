import { expect, it } from 'vitest'
import { merchantTransactionFilter } from './merchant-transaction-filter'

it('matches report scope by entry owners and includes pending while excluding report-excluded expenses', () => {
  const filter = merchantTransactionFilter(
    'merchant-1',
    '2026-11-01',
    '2026-11-30',
    ['member-1'],
  )
  expect(filter).toMatchObject({
    merchantID: 'merchant-1',
    hasCategoryWith: [{ type: 'expense' }],
    excludeFromReports: false,
    hasTransactionEntriesWith: [
      { hasAccountWith: [{ userIDIn: ['member-1'] }] },
    ],
  })
  expect(filter).not.toHaveProperty('userIDIn')
  expect(filter).not.toHaveProperty('pending')
  expect(new Date(filter.datetimeLT).getTime()).toBeGreaterThan(
    new Date(filter.datetimeGTE).getTime(),
  )
})
it('shows only unassigned expenses without accidentally restricting the combined household', () => {
  const filter = merchantTransactionFilter(
    null,
    '2026-11-01',
    '2026-11-30',
    null,
  )
  expect(filter).toHaveProperty('merchantIDIsNil', true)
  expect(filter).not.toHaveProperty('merchantID')
  expect(filter).not.toHaveProperty('hasTransactionEntriesWith')
})
