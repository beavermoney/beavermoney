/* eslint-disable relay/unused-fields -- Shared with the chart so route prefetch does not import Recharts. */
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
