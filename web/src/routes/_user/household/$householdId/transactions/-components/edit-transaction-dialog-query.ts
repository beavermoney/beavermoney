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
          # eslint-disable-next-line relay/unused-fields
          price
          # eslint-disable-next-line relay/unused-fields
          investment {
            id
            # eslint-disable-next-line relay/unused-fields
            name
            # eslint-disable-next-line relay/unused-fields
            account {
              id
            }
            # eslint-disable-next-line relay/unused-fields
            householdCurrency {
              # eslint-disable-next-line relay/unused-fields
              code
            }
          }
        }
        # eslint-disable-next-line relay/unused-fields
        transactionEntries {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...transactionEntryCardFragment
          id
          amount
          # eslint-disable-next-line relay/unused-fields
          account {
            id
            # eslint-disable-next-line relay/unused-fields
            name
            # eslint-disable-next-line relay/unused-fields
            householdCurrency {
              # eslint-disable-next-line relay/unused-fields
              code
            }
          }
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

    household {
      # eslint-disable-next-line relay/unused-fields
      accounts(where: { archived: false }) {
        # eslint-disable-next-line relay/unused-fields
        edges {
          node {
            id
            # eslint-disable-next-line relay/unused-fields
            name
            # eslint-disable-next-line relay/unused-fields
            type
            # eslint-disable-next-line relay/unused-fields
            icon
            # eslint-disable-next-line relay/unused-fields
            value
            # eslint-disable-next-line relay/unused-fields
            householdCurrency {
              # eslint-disable-next-line relay/unused-fields
              code
            }
            # eslint-disable-next-line relay/unused-fields
            investments {
              id
              # eslint-disable-next-line relay/unused-fields
              name
              # eslint-disable-next-line relay/unused-fields
              symbol
            }
          }
        }
      }
    }
  }
`
