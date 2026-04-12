import { createContext, useContext } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useUserHouseholdFragment$key } from './__generated__/useUserHouseholdFragment.graphql'

const UseUserHouseholdFragment = graphql`
  fragment useUserHouseholdFragment on UserHousehold {
    # eslint-disable-next-line relay/unused-fields
    id
    # eslint-disable-next-line relay/unused-fields
    role
    # eslint-disable-next-line relay/unused-fields
    householdCurrency {
      id
      code
    }
  }
`

const UserHouseholdContext = createContext<useUserHouseholdFragment$key | null>(
  null,
)

export const UserHouseholdProvider = ({
  children,
  userHouseholdRef,
}: {
  children: React.ReactNode
  userHouseholdRef: useUserHouseholdFragment$key
}) => {
  return (
    <UserHouseholdContext.Provider value={userHouseholdRef}>
      {children}
    </UserHouseholdContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUserHousehold = () => {
  const ref = useContext(UserHouseholdContext)
  if (ref === null) {
    throw new Error(
      'useUserHousehold must be used within a UserHouseholdProvider',
    )
  }
  const userHousehold = useFragment(UseUserHouseholdFragment, ref)
  return { userHousehold }
}
