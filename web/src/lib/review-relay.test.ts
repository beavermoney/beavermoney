import Decimal from 'decimal.js'
import { afterEach, expect, it, vi } from 'vitest'
import {
  Environment,
  Network,
  RecordSource,
  Store,
  createOperationDescriptor,
} from 'relay-runtime'
import journalQuery from '@/components/__generated__/reviewJournalQuery.graphql'
import chartQuery from '@/routes/_user/household/$householdId/accounts/-components/__generated__/netWorthChartQuery.graphql'
import { parseReview, snapshotValue, type ReviewRow } from './review-history'

afterEach(() => vi.restoreAllMocks())

const snapshot = (
  id: string,
  cash: string,
  quantity: string,
  price: string,
  value: string,
) => ({
  id,
  createTime: `2026-11-${id === 'review-1' ? '20' : '21'}T12:00:00Z`,
  note: null,
  snapshotEntries: [],
  snapshotRates: [],
  review: {
    version: 2,
    complete: true,
    activeAccountIds: ['account-1'],
    accounts: [
      {
        accountId: 'account-1',
        icon: null,
        name: 'Captured account',
        type: 'investment',
        category: null,
        ownerId: 'owner-1',
        ownerName: 'Owner',
        currency: 'CAD',
        cash,
        value,
        archived: false,
        holdings: [
          {
            investmentId: 'holding-1',
            name: 'Captured holding',
            symbol: 'META',
            currency: 'CAD',
            quantity,
            price,
            value: new Decimal(quantity).mul(price).toFixed(),
            average: '5',
            confirmedAt: '2026-11-20T11:00:00Z',
            needsReview: false,
            archived: false,
          },
        ],
      },
    ],
    rates: [],
  },
})

it('isolates each captured state from other reviews and live entities in the real Relay store', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const source = new RecordSource()
  const environment = new Environment({
    network: Network.create(() =>
      Promise.reject(new Error('Unexpected network request')),
    ),
    store: new Store(source),
  })
  const journal = createOperationDescriptor(journalQuery, { count: 100 })
  const chart = createOperationDescriptor(chartQuery, { count: 500 })
  const first = snapshot('review-1', '10', '2', '10', '30')
  const second = snapshot('review-2', '20', '3', '20', '80')
  const liveAccount = {
    id: 'account-1',
    name: 'Live account',
    type: 'investment',
    reviewRevision: 'current',
    value: '900',
    householdCurrency: { id: 'currency-1', code: 'CAD' },
    investments: [
      { id: 'holding-1', name: 'Live holding', averageNeedsReview: false },
    ],
  }
  const household = {
    id: 'household-1',
    householdRates: [],
    reviewAccounts: { edges: [{ node: liveAccount }] },
    snapshots: {
      edges: [{ node: first }, { node: second }],
      pageInfo: { hasPreviousPage: false },
    },
  }
  environment.commitPayload(journal, { household })
  // Loading the chart in a different order must not rewrite either review or
  // entities used by the live account/review UI.
  environment.commitPayload(chart, {
    household: {
      ...household,
      snapshots: {
        ...household.snapshots,
        edges: [{ node: second }, { node: first }],
      },
    },
  })
  expect(source.get('account-1')).toMatchObject({
    __typename: 'Account',
    name: 'Live account',
    value: '900',
  })
  expect(source.get('holding-1')).toMatchObject({
    __typename: 'Investment',
    name: 'Live holding',
    averageNeedsReview: false,
  })
  const data = environment.lookup(journal.fragment).data as {
    household: { snapshots: { edges: Array<{ node: ReviewRow }> } }
  }
  const rows = data.household.snapshots.edges.map((edge) => edge.node)
  expect(rows.map((row) => snapshotValue(row, 'CAD')?.toString())).toEqual([
    '30',
    '80',
  ])
  expect(
    rows.map(
      (row) => parseReview(row.review)?.accounts[0].holdings[0].quantity,
    ),
  ).toEqual(['2', '3'])
  expect(
    rows.map((row) => parseReview(row.review)?.accounts[0].holdings[0].price),
  ).toEqual(['10', '20'])
  expect(parseReview(rows[0].review)?.accounts[0].id).toBe('account-1')
  expect(parseReview(rows[0].review)?.accounts[0].holdings[0].id).toBe(
    'holding-1',
  )
  expect(warn).not.toHaveBeenCalled()
  expect(error).not.toHaveBeenCalled()
})
