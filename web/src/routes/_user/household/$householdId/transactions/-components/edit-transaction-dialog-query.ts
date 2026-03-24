import { graphql } from 'relay-runtime'

export const EditTransactionDialogQuery = graphql`
  query editTransactionDialogQuery($transactionId: ID!) {
    node(id: $transactionId) {
      __typename
      ... on Transaction {
        id
        description
        datetime
        categoryID
        excludeFromReports
        category {
          id
          name
          type
        }
        investmentLots {
          ...investmentLotCardFragment
          id
          amount
        }
        transactionEntries {
          ...transactionEntryCardFragment
          id
          amount
        }
      }
    }

    transactionCategories {
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
