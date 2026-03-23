import { graphql } from 'react-relay'

export const subscriptionsQuery = graphql`
  query SubscriptionsQuery {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...subscriptionsPanelFragment
    }
  }
`
