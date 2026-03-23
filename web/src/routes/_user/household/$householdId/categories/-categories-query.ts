import { graphql } from 'relay-runtime'

export const categoriesQuery = graphql`
  query CategoriesQuery($startDate: Time!, $endDate: Time!) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...categoriesPanelFragment
        @arguments(startDate: $startDate, endDate: $endDate)
    }
  }
`
