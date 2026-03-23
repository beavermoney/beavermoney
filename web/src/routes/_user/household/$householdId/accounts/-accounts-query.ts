import { graphql } from 'relay-runtime'

export const accountsQuery = graphql`
  query AccountsQuery {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...accountsPanelFragment
    }
  }
`
