import { graphql } from 'relay-runtime'

export const settingsQuery = graphql`
  query SettingsQuery {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...generalSettingsHouseholdFragment
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...membersSettingsFragment
    }
    user {
      id
      # eslint-disable-next-line relay/unused-fields
      name
      # eslint-disable-next-line relay/unused-fields
      email
    }
    # eslint-disable-next-line relay/must-colocate-fragment-spreads
    ...generalSettingsCurrenciesFragment
    userHouseholds {
      # eslint-disable-next-line relay/unused-fields
      id
      # eslint-disable-next-line relay/unused-fields
      role
      # eslint-disable-next-line relay/unused-fields
      user {
        # eslint-disable-next-line relay/unused-fields
        id
      }
    }
  }
`
