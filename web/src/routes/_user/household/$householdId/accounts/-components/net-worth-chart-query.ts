import type { netWorthChartQuery } from './__generated__/netWorthChartQuery.graphql'
import { graphql } from 'relay-runtime'

export const NetWorthChartQuery = graphql`
  query netWorthChartQuery(
    $count: Int!
    $where: SnapshotWhereInput
    $includeHoldings: Boolean!
  ) {
    household {
      snapshots(last: $count, where: $where) {
        pageInfo {
          hasPreviousPage
        }
        edges {
          node {
            id
            review {
              version
              complete
              accounts {
                accountId
                type
                category
                ownerId
                currency
                cash
                value
                holdings @include(if: $includeHoldings) {
                  investmentId
                  currency
                  quantity
                  value
                  average
                  needsReview
                }
              }
              rates {
                from
                to
                rate
              }
            }
            createTime
            snapshotEntries {
              userID
              liquidity
              investment
              property
              receivable
              liability
              householdCurrency {
                code
              }
            }
            snapshotRates {
              rate
              fromCurrency {
                code
              }
              toCurrency {
                code
              }
            }
          }
        }
      }
    }
  }
`

export type Duration = '1M' | '3M' | '6M' | '1Y' | 'All'

export const DURATIONS: Duration[] = ['1M', '3M', '6M', '1Y', 'All']

export function durationToDate(d: Duration): string | null {
  const now = new Date()
  switch (d) {
    case '1M':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      ).toISOString()
    case '3M':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate(),
      ).toISOString()
    case '6M':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate(),
      ).toISOString()
    case '1Y':
      return new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      ).toISOString()
    case 'All':
      return null
  }
}

// The query and projection stay separate from Recharts so loaders can prefetch
// without pulling chart rendering code into the startup dependency chain.
export function chartSnapshots(data: netWorthChartQuery['response']) {
  return (data.household.snapshots.edges ?? []).flatMap((edge) => {
    const node = edge?.node
    if (!node) return []
    return [
      {
        id: node.id,
        createTime: node.createTime,
        review: node.review
          ? {
              version: node.review.version,
              complete: node.review.complete,
              accounts: node.review.accounts.map((account) => ({
                id: account.accountId,

                type: account.type,
                category: account.category,
                ownerId: account.ownerId,
                currency: account.currency,
                cash: account.cash,
                value: account.value,
                holdings: account.holdings?.map((holding) => ({
                  id: holding.investmentId,

                  currency: holding.currency,
                  quantity: holding.quantity,
                  value: holding.value,
                  average: holding.average,
                  needsReview: holding.needsReview,
                })),
              })),
              rates: node.review.rates.map((rate) => ({
                from: rate.from,
                to: rate.to,
                rate: rate.rate,
              })),
            }
          : null,

        snapshotEntries: node.snapshotEntries?.map((entry) => ({
          userID: entry.userID,
          liquidity: entry.liquidity,
          investment: entry.investment,
          property: entry.property,
          receivable: entry.receivable,
          liability: entry.liability,
          householdCurrency: { code: entry.householdCurrency.code },
        })),
        snapshotRates: node.snapshotRates?.map((rate) => ({
          rate: rate.rate,
          fromCurrency: { code: rate.fromCurrency.code },
          toCurrency: { code: rate.toCurrency.code },
        })),
      },
    ]
  })
}
