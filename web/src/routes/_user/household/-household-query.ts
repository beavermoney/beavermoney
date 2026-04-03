import { graphql } from 'relay-runtime'

export const householdQuery = graphql`
  query HouseholdQuery {
    households {
      id
    }
  }
`
