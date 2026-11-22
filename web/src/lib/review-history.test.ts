import { describe, it, expect } from 'vitest'
import {
  parseReview,
  chartHistory,
  historyMeasure,
  snapshotValue,
  snapshotDelta,
  reviewHistory,
  selectedValue,
  holdingGain,
  converted,
  type ReviewRow,
} from './review-history'
const account = (id: number, value: string) => ({
  id: String(id),
  name: 'Account',
  type: 'investment',
  category: 'tfsa',
  ownerId: '1',
  ownerName: 'Joey',
  currency: 'USD',
  cash: value,
  value,
  holdings: [],
})
const row = (
  id: string,
  accounts: ReturnType<typeof account>[],
  rate: string,
): ReviewRow => ({
  id,
  createTime: `2026-11-${id.padStart(2, '0')}T12:00:00Z`,
  review: {
    version: 2,
    complete: true,
    activeAccountIds: accounts.map((a) => a.id),
    accounts,
    rates: [{ from: 'USD', to: 'CAD', rate }],
  },
})
describe('manual review history', () => {
  it('uses each full capture’s FX when unchanged account observations are reused', () => {
    const points = reviewHistory([
      row('1', [account(1, '100'), account(2, '50')], '1.3'),
      row('2', [account(1, '100'), account(2, '50')], '1.4'),
    ])
    expect(selectedValue(points[0], 'all', 'CAD')?.toString()).toBe('195')
    expect(selectedValue(points[1], 'all', 'CAD')?.toString()).toBe('210')
    expect(selectedValue(points[1], 'cash:1', 'CAD')?.toString()).toBe('140')
  })
  it('retains a complete later capture when an earlier journal entry is deleted', () => {
    const later = row('2', [account(1, '120'), account(2, '50')], '1.4')
    expect(reviewHistory([later])[0].complete).toBe(true)
    expect(
      selectedValue(reviewHistory([later])[0], 'all', 'CAD')?.toString(),
    ).toBe('238')
  })
  it('never fabricates missing FX', () =>
    expect(converted('100', 'USD', 'CAD', [])).toBeNull())
  it('does exact arithmetic with fractional shares and hides unconfirmed gains', () => {
    const h = {
      id: '1',
      name: 'A',
      currency: 'USD',
      quantity: '0.123456789123456789',
      price: '10',
      value: '1.23456789123456789',
      average: '5',
      needsReview: false,
    }
    expect(holdingGain(h).amount).toBe('0.617283945617283945')
    expect(holdingGain(h).percent).toBe('100.00')
    expect(holdingGain({ ...h, needsReview: true }).amount).toBeNull()
    expect(holdingGain({ ...h, average: '0' }).percent).toBeNull()
    expect(
      holdingGain({ ...h, quantity: '0', value: '0', average: null }),
    ).toEqual({ amount: '0', percent: null })
  })
})

it('preserves older category snapshots with their own FX and signed liabilities', () => {
  const saved: ReviewRow = {
    id: '1',
    createTime: '2026-01-01',
    snapshotEntries: [
      {
        userID: '1',
        liquidity: '100',
        investment: '50',
        property: '0',
        receivable: '0',
        liability: '-20',
        householdCurrency: { code: 'USD' },
      },
    ],
    snapshotRates: [
      {
        rate: '1.3',
        fromCurrency: { code: 'USD' },
        toCurrency: { code: 'CAD' },
      },
    ],
  }
  expect(snapshotValue(saved, 'CAD')?.toString()).toBe('169')
  expect(snapshotValue(saved, 'CAD', null, 'liability')?.toString()).toBe('-26')
  expect(snapshotValue(saved, 'CAD', ['2'])?.toString()).toBe('0')
  expect(snapshotValue(saved, 'EUR')).toBeNull()
})

it('summarizes saved categories with their frozen FX and owner scope', () => {
  const saved = row(
    '3',
    [
      account(1, '100'),
      { ...account(2, '50'), currency: 'CAD' },
      { ...account(3, '-20'), type: 'liability' },
    ],
    '1.3',
  )
  expect(snapshotValue(saved, 'CAD', null, 'investment')?.toString()).toBe(
    '180',
  )
  expect(snapshotValue(saved, 'CAD', null, 'liability')?.toString()).toBe('-26')
  expect(snapshotValue(saved, 'CAD')?.toString()).toBe('154')
  expect(snapshotValue(saved, 'CAD', null, 'property')?.toString()).toBe('0')
  expect(snapshotValue(saved, 'CAD', ['2'], 'investment')?.toString()).toBe('0')
  expect(snapshotValue(saved, 'CAD', ['2'])?.toString()).toBe('0')
  expect(snapshotValue(saved, 'EUR', null, 'investment')).toBeNull()
})

it('reads mixed legacy and detailed snapshots without inventing old account history', () => {
  const legacy: ReviewRow = {
    id: '1',
    createTime: '2026-11-01T12:00:00Z',
    note: 'Old review',
    review: null,
    snapshotEntries: [
      {
        userID: '1',
        liquidity: '100',
        investment: '200',
        property: '0',
        receivable: '0',
        liability: '-50',
        householdCurrency: { code: 'USD' },
      },
      {
        userID: '2',
        liquidity: '80',
        investment: '0',
        property: '0',
        receivable: '0',
        liability: '0',
        householdCurrency: { code: 'CAD' },
      },
    ],
    snapshotRates: [
      {
        rate: '1.25',
        fromCurrency: { code: 'USD' },
        toCurrency: { code: 'CAD' },
      },
      {
        rate: '0.8',
        fromCurrency: { code: 'CAD' },
        toCurrency: { code: 'USD' },
      },
    ],
  }
  const detailed = row(
    '2',
    [
      { ...account(1, '100'), type: 'liquidity' },
      account(2, '200'),
      { ...account(3, '-50'), type: 'liability' },
      { ...account(4, '80'), type: 'liquidity', currency: 'CAD', ownerId: '2' },
    ],
    '1.25',
  )
  const doc = parseReview(detailed.review)!
  doc.rates!.push({ from: 'CAD', to: 'USD', rate: '0.8' })
  const modern = { ...detailed, review: doc }
  for (const currency of ['USD', 'CAD']) {
    for (const owners of [null, ['1'], ['2'], ['missing']]) {
      for (const type of [
        undefined,
        'liquidity',
        'investment',
        'property',
        'receivable',
        'liability',
      ] as const) {
        expect(snapshotValue(modern, currency, owners, type)?.toFixed()).toBe(
          snapshotValue(legacy, currency, owners, type)?.toFixed(),
        )
      }
    }
  }
  expect(snapshotValue(legacy, 'CAD')?.toFixed()).toBe('392.5')
  expect(snapshotValue(legacy, 'USD')?.toFixed()).toBe('314')
  expect(reviewHistory([modern, legacy]).map((p) => p.row.id)).toEqual(['2'])
  expect(
    snapshotValue({ ...legacy, note: 'Edited later' }, 'CAD')?.toFixed(),
  ).toBe('392.5')
  expect(
    snapshotValue({ ...modern, review: { broken: true } }, 'CAD'),
  ).toBeNull()
})

it('compares the full household using historical FX and signed net worth', () => {
  const previous = row(
    '1',
    [account(1, '100'), { ...account(2, '-20'), type: 'liability' }],
    '1.3',
  )
  expect(snapshotDelta('140', previous, 'CAD', 'investment')?.toFixed()).toBe(
    '10',
  )
  expect(snapshotDelta('-30', previous, 'CAD', 'liability')?.toFixed()).toBe(
    '4',
  )
  expect(snapshotDelta('110', previous, 'CAD')?.toFixed()).toBe('6')
  expect(snapshotDelta('110', undefined, 'CAD')).toBeNull()
  expect(snapshotDelta(null, previous, 'CAD')).toBeNull()
  expect(snapshotDelta('110', previous, 'EUR')).toBeNull()
})

it('distinguishes a zero category or member total from an investment that did not exist', () => {
  const point = reviewHistory([row('1', [account(1, '100')], '1.3')])[0]
  expect(selectedValue(point, 'type:property', 'CAD')?.toFixed()).toBe('0')
  expect(selectedValue(point, 'all', 'CAD', ['missing'])?.toFixed()).toBe('0')
  expect(selectedValue(point, 'holding:missing', 'CAD')).toBeNull()
  expect(selectedValue(point, 'account:missing', 'CAD')).toBeNull()
  expect(
    selectedValue({ ...point, complete: false }, 'type:property', 'CAD'),
  ).toBeNull()
  expect(selectedValue(point, 'all', 'EUR')).toBeNull()
})

it('keeps liability deltas correct when a payment turns debt into a credit balance', () => {
  const previous = row(
    '1',
    [{ ...account(1, '-50'), type: 'liability', currency: 'CAD' }],
    '1.3',
  )
  expect(snapshotDelta('20', previous, 'CAD', 'liability')?.toFixed()).toBe(
    '-70',
  )
  const credit = row(
    '2',
    [{ ...account(1, '20'), type: 'liability', currency: 'CAD' }],
    '1.3',
  )
  expect(snapshotDelta('-50', credit, 'CAD', 'liability')?.toFixed()).toBe('70')
})

describe('compact chart observations', () => {
  const holding = {
    investmentId: '9',
    currency: 'USD',
    quantity: '2',
    value: '30',
    average: '10',
    needsReview: false,
  }
  const account = {
    accountId: '7',
    type: 'investment',
    category: 'tfsa',
    ownerId: '1',
    currency: 'USD',
    cash: '5',
    value: '35',
  }
  const row = (
    rates: { from: string; to: string; rate: string }[],
    holdings?: (typeof holding)[],
  ) => ({
    id: '1',
    createTime: '2026-11-01',
    review: {
      version: 2,
      complete: true,
      rates,
      accounts: [{ ...account, ...(holdings ? { holdings } : {}) }],
    },
  })
  it('uses capture FX and owner filters without loading holdings or labels', () => {
    const input = row([{ from: 'USD', to: 'CAD', rate: '1.4' }])
    const point = chartHistory([input])[0]
    expect(selectedValue(point, 'all', 'CAD')?.toString()).toBe('49')
    expect(selectedValue(point, 'cash:7', 'CAD')?.toString()).toBe('7')
    expect(selectedValue(point, 'all', 'CAD', ['2'])?.toString()).toBe('0')
    expect(selectedValue(point, 'account:8', 'CAD')).toBeNull()
    expect(parseReview(input.review)).toBeNull() // Full journals still require labels.
    expect(selectedValue(chartHistory([row([])])[0], 'all', 'CAD')).toBeNull()
  })
  it('retains holding values and hides unconfirmed gains', () => {
    const rates = [{ from: 'USD', to: 'CAD', rate: '1.4' }]
    const point = chartHistory([row(rates, [holding])])[0]
    expect(selectedValue(point, 'holding:9', 'CAD')?.toString()).toBe('42')
    expect(historyMeasure(point, 'holding:9', 'gain', 'CAD')?.toString()).toBe(
      '14',
    )
    expect(historyMeasure(point, 'holding:9', 'gain', 'CAD', ['2'])).toBeNull()
    const unconfirmed = chartHistory([
      row(rates, [{ ...holding, needsReview: true }]),
    ])[0]
    expect(historyMeasure(unconfirmed, 'holding:9', 'gain', 'CAD')).toBeNull()
  })
})
