import Decimal from 'decimal.js'
import { z } from 'zod'
Decimal.set({ precision: 60 })
// Snapshot projections deliberately expose identity references instead of Relay's
// global `id`. Normalize only after reading the payload; legacy review fixtures
// may still use `id`, but normalized cache records must remain snapshot-local.
function reviewIdentity(value: unknown, field: 'accountId' | 'investmentId') {
  if (!value || typeof value !== 'object') return value
  const record = value as Record<string, unknown>
  return { ...record, id: record[field] ?? record.id }
}
const identity = z
  .union([z.string().min(1), z.number().int()])
  .transform(String)
const amount = z.string().regex(/^-?\d+(\.\d+)?$/)
export const reviewHoldingSchema = z.preprocess(
  (value) => reviewIdentity(value, 'investmentId'),
  z.object({
    id: identity,
    name: z.string(),
    symbol: z.string().optional(),
    currency: z.string(),
    quantity: amount,
    price: amount,
    value: amount,
    average: amount.nullable(),
    confirmedAt: z.string().nullable().optional(),
    needsReview: z.boolean(),
  }),
)
export const reviewAccountSchema = z.preprocess(
  (value) => reviewIdentity(value, 'accountId'),
  z.object({
    id: identity,
    icon: z.string().nullable().optional(),
    name: z.string(),
    type: z.string(),
    category: z.string().nullable(),
    ownerId: z.coerce.string(),
    ownerName: z.string(),
    currency: z.string(),
    cash: amount,
    value: amount,
    holdings: z.array(reviewHoldingSchema),
  }),
)
const rateSchema = z.object({
  from: z.string(),
  to: z.string(),
  rate: amount,
})
const documentSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  complete: z.boolean().optional(),
  activeAccountIds: z.array(z.coerce.string()).optional(),
  accounts: z.array(reviewAccountSchema),
  rates: z.array(rateSchema).optional(),
})
export type ReviewAccount = z.infer<typeof reviewAccountSchema>
export type ReviewHolding = z.infer<typeof reviewHoldingSchema>
export type SavedRate = z.infer<typeof rateSchema>
export type ReviewRow = {
  readonly id: string
  readonly createTime: string
  readonly note?: string | null
  readonly review?: unknown
  readonly snapshotEntries?: ReadonlyArray<{
    readonly userID: string
    readonly liquidity: string
    readonly investment: string
    readonly property: string
    readonly receivable: string
    readonly liability: string
    readonly householdCurrency: { readonly code: string }
  }> | null
  readonly snapshotRates?: ReadonlyArray<{
    readonly rate: string
    readonly fromCurrency: { readonly code: string }
    readonly toCurrency: { readonly code: string }
  }> | null
}
export function parseReview(raw: unknown) {
  if (!raw) return null
  try {
    const parsed = documentSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
export function reviewRates(row: ReviewRow): SavedRate[] {
  return (
    parseReview(row.review)?.rates ??
    (row.snapshotRates ?? []).map((r) => ({
      from: r.fromCurrency.code,
      to: r.toCurrency.code,
      rate: r.rate,
    }))
  )
}
export function converted(
  value: string,
  from: string,
  to: string,
  rates: readonly SavedRate[],
): Decimal | null {
  if (from === to) return new Decimal(value)
  const rate = rates.find((r) => r.from === from && r.to === to)
  return rate && new Decimal(rate.rate).gt(0)
    ? new Decimal(value).mul(rate.rate)
    : null
}
export function holdingGain(
  h: Pick<ReviewHolding, 'quantity' | 'average' | 'value' | 'needsReview'>,
) {
  if (new Decimal(h.quantity).isZero()) return { amount: '0', percent: null }
  if (h.needsReview || h.average === null)
    return { amount: null, percent: null }
  const basis = new Decimal(h.average).mul(h.quantity)
  const gain = new Decimal(h.value).sub(basis)
  return {
    amount: gain.toFixed(),
    percent: basis.gt(0) ? gain.div(basis).mul(100).toFixed(2) : null,
  }
}
export type Observation = {
  account: ReviewAccount
  date: string
  rates: SavedRate[]
  reviewId: string
}
export type HistoryPoint = {
  row: ReviewRow
  accounts: Observation[]
  complete: boolean
}
// The server resolves shared observations for each complete capture. Always use
// that capture's FX, even when its account/holding observations were reused.
export function reviewHistory(rows: readonly ReviewRow[]): HistoryPoint[] {
  return [...rows]
    .sort(
      (a, b) =>
        a.createTime.localeCompare(b.createTime) || Number(a.id) - Number(b.id),
    )
    .flatMap((row) => {
      const doc = parseReview(row.review)
      if (!doc) return []
      return [
        {
          row,
          complete: !!doc.complete,
          accounts: doc.accounts.map((account) => ({
            account,
            date: row.createTime,
            rates: reviewRates(row),
            reviewId: row.id,
          })),
        },
      ]
    })
}

// Charts need financial observations, not journal labels or icon metadata.
const chartHoldingSchema = z.preprocess(
  (value) => reviewIdentity(value, 'investmentId'),
  z.object({
    id: identity,
    currency: z.string(),
    quantity: amount,
    value: amount,
    average: amount.nullable(),
    needsReview: z.boolean(),
  }),
)
const chartAccountSchema = z.preprocess(
  (value) => reviewIdentity(value, 'accountId'),
  z.object({
    id: identity,
    type: z.string(),
    category: z.string().nullable(),
    ownerId: z.coerce.string(),
    currency: z.string(),
    cash: amount,
    value: amount,
    holdings: z.array(chartHoldingSchema).optional().default([]),
  }),
)
const chartDocumentSchema = documentSchema.extend({
  accounts: z.array(chartAccountSchema),
})
type ChartAccount = z.infer<typeof chartAccountSchema>
type FinancialHistoryPoint = Omit<HistoryPoint, 'accounts'> & {
  accounts: Array<Omit<Observation, 'account'> & { account: ChartAccount }>
}
export function chartHistory(
  rows: readonly ReviewRow[],
): FinancialHistoryPoint[] {
  return [...rows]
    .sort(
      (a, b) =>
        a.createTime.localeCompare(b.createTime) || Number(a.id) - Number(b.id),
    )
    .flatMap((row) => {
      const parsed = chartDocumentSchema.safeParse(row.review)
      if (!parsed.success) return []
      const doc = parsed.data
      const rates =
        doc.rates ??
        (row.snapshotRates ?? []).map((r) => ({
          from: r.fromCurrency.code,
          to: r.toCurrency.code,
          rate: r.rate,
        }))
      return [
        {
          row,
          complete: !!doc.complete,
          accounts: doc.accounts.map((account) => ({
            account,
            date: row.createTime,
            rates,
            reviewId: row.id,
          })),
        },
      ]
    })
}

export function selectedValue(
  point: FinancialHistoryPoint,
  scope: string,
  currency: string,
  ownerIds: readonly string[] | null = null,
): Decimal | null {
  let total = new Decimal(0)
  let found = false
  for (const obs of point.accounts) {
    const a = obs.account
    if (ownerIds && !ownerIds.includes(String(a.ownerId))) continue
    let value = a.value,
      code = a.currency
    if (scope.startsWith('type:') && a.type !== scope.slice(5)) continue
    if (
      scope.startsWith('category:') &&
      (a.category ?? 'uncategorized') !== scope.slice(9)
    )
      continue
    if (scope.startsWith('account:') && String(a.id) !== scope.slice(8))
      continue
    if (scope.startsWith('cash:')) {
      if (String(a.id) !== scope.slice(5)) continue
      value = a.cash
    }
    if (scope.startsWith('holding:')) {
      const h = a.holdings.find((h) => String(h.id) === scope.slice(8))
      if (!h) continue
      value = h.value
      code = h.currency
    }
    const convertedValue = converted(value, code, currency, obs.rates)
    if (convertedValue === null) return null
    total = total.add(convertedValue)
    found = true
  }
  // A complete household capture also proves that an absent category/member
  // has zero value. Missing individual entities remain unavailable before their
  // first observation rather than inventing a historical zero balance.
  const aggregate =
    scope === 'all' ||
    scope.startsWith('type:') ||
    scope.startsWith('category:')
  return found || (point.complete && aggregate) ? total : null
}

export type HoldingMetric =
  'value' | 'gain' | 'percent' | 'average' | 'quantity'
export function historyMeasure(
  point: FinancialHistoryPoint,
  scope: string,
  metric: HoldingMetric,
  currency: string,
  ownerIds: readonly string[] | null = null,
): Decimal | null {
  if (metric === 'value' || !scope.startsWith('holding:'))
    return selectedValue(point, scope, currency, ownerIds)
  for (const obs of point.accounts) {
    if (ownerIds && !ownerIds.includes(String(obs.account.ownerId))) continue
    const h = obs.account.holdings.find((h) => String(h.id) === scope.slice(8))
    if (!h) continue
    if (metric === 'quantity') return new Decimal(h.quantity)
    if (metric === 'average')
      return h.average === null
        ? null
        : converted(h.average, h.currency, currency, obs.rates)
    const gain = holdingGain(h)
    if (metric === 'percent')
      return gain.percent === null ? null : new Decimal(gain.percent)
    return gain.amount === null
      ? null
      : converted(gain.amount, h.currency, currency, obs.rates)
  }
  return null
}

// A journal entry is one complete review, never a running total of other entries.
export function snapshotValue(
  row: ReviewRow,
  currency: string,
  ownerIds: readonly string[] | null = null,
  type?: 'liquidity' | 'investment' | 'property' | 'receivable' | 'liability',
): Decimal | null {
  const doc = parseReview(row.review)
  if (doc) {
    const accounts = doc.accounts.filter(
      (a) =>
        (!type || a.type === type) &&
        (!ownerIds || ownerIds.includes(String(a.ownerId))),
    )
    if (!accounts.length) return new Decimal(0)
    return selectedValue(
      {
        row,
        complete: true,
        accounts: accounts.map((account) => ({
          account,
          date: row.createTime,
          rates: reviewRates(row),
          reviewId: row.id,
        })),
      },
      'all',
      currency,
      ownerIds,
    )
  }
  if (row.review || !row.snapshotEntries?.length) return null
  let total = new Decimal(0)
  for (const entry of row.snapshotEntries) {
    if (ownerIds && !ownerIds.includes(entry.userID)) continue
    const value = type
      ? new Decimal(entry[type])
      : new Decimal(entry.liquidity)
          .add(entry.investment)
          .add(entry.property)
          .add(entry.receivable)
          .add(entry.liability)
    const result = converted(
      value.toFixed(),
      entry.householdCurrency.code,
      currency,
      reviewRates(row),
    )
    if (result === null) return null
    total = total.add(result)
  }
  return total
}

// Liabilities display the inverse of their stored balance, including a
// negative debt amount for an overpayment. Net worth keeps the stored sign.
export function snapshotDelta(
  current: string | null,
  previous: ReviewRow | undefined,
  currency: string,
  type?: 'liquidity' | 'investment' | 'property' | 'receivable' | 'liability',
): Decimal | null {
  if (current === null || !previous) return null
  const before = snapshotValue(previous, currency, null, type)
  if (before === null) return null
  return type === 'liability'
    ? before.sub(current)
    : new Decimal(current).sub(before)
}
