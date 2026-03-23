import { graphql } from 'react-relay'

export const subscriptionsQuery = graphql`
  query SubscriptionsQuery {
    household {
      id
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...subscriptionsPanelFragment
    }
  }
`
