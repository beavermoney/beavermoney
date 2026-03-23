import { graphql } from 'relay-runtime'

export const investmentsQuery = graphql`
  query InvestmentsQuery {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...investmentsPanelFragment
    }
  }
`
