import { graphql } from 'relay-runtime'

export const transactionsQuery = graphql`
  query TransactionsQuery(
    $where: TransactionWhereInput
    $startDate: Time!
    $endDate: Time!
  ) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...transactionsPanelFragment
        @arguments(where: $where, startDate: $startDate, endDate: $endDate)
    }
  }
`
