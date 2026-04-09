import { createContext, useContext } from 'react'
import { graphql, useFragment } from 'react-relay'
import type { useHouseholdFragment$key } from './__generated__/useHouseholdFragment.graphql'

const UseHouseholdFragment = graphql`
  fragment useHouseholdFragment on Household {
    # eslint-disable-next-line relay/unused-fields
    id
    # eslint-disable-next-line relay/unused-fields
    name
    # eslint-disable-next-line relay/unused-fields
    locale
    # eslint-disable-next-line relay/unused-fields
    currency {
      id
      code
    }
  }
`

const HouseholdContext = createContext<useHouseholdFragment$key | null>(null)

export const HouseholdProvider = ({
  children,
  householdRef,
}: {
  children: React.ReactNode
  householdRef: useHouseholdFragment$key
}) => {
  return (
    <HouseholdContext.Provider value={householdRef}>
      {children}
    </HouseholdContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHousehold = () => {
  const ref = useContext(HouseholdContext)
  if (ref === null) {
    throw new Error('useHousehold must be used within a HouseholdProvider')
  }
  const household = useFragment(UseHouseholdFragment, ref)
  return { household }
}
