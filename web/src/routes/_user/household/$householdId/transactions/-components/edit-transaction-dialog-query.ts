import { graphql } from 'relay-runtime'

export const EditTransactionDialogQuery = graphql`
  query editTransactionDialogQuery($transactionId: ID!) {
    node(id: $transactionId) {
      __typename
      ... on Transaction {
        # eslint-disable-next-line relay/unused-fields
        id
        # eslint-disable-next-line relay/unused-fields
        description
        # eslint-disable-next-line relay/unused-fields
        datetime
        # eslint-disable-next-line relay/unused-fields
        categoryID
        # eslint-disable-next-line relay/unused-fields
        excludeFromReports
        # eslint-disable-next-line relay/unused-fields
        category {
          id
          name
          type
        }
        # eslint-disable-next-line relay/unused-fields
        investmentLots {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...investmentLotCardFragment
          id
          amount
        }
        # eslint-disable-next-line relay/unused-fields
        transactionEntries {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...transactionEntryCardFragment
          id
          amount
        }
      }
    }

    transactionCategories {
      # eslint-disable-next-line relay/unused-fields
      edges {
        node {
          id
          name
          type
        }
      }
    }
  }
`
