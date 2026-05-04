import { createContext, useContext, useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'
import type { useHouseholdMembersFragment$key } from './__generated__/useHouseholdMembersFragment.graphql'

const UseHouseholdMembersFragment = graphql`
  fragment useHouseholdMembersFragment on Household {
    userHouseholds {
      id
      user {
        id
        name
        isSynthetic
      }
    }
  }
`

export type HouseholdMember = {
  id: string
  name: string
  isSynthetic: boolean
}

const HouseholdMembersContext =
  createContext<useHouseholdMembersFragment$key | null>(null)

export const HouseholdMembersProvider = ({
  children,
  householdRef,
}: {
  children: React.ReactNode
  householdRef: useHouseholdMembersFragment$key
}) => {
  return (
    <HouseholdMembersContext.Provider value={householdRef}>
      {children}
    </HouseholdMembersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHouseholdMembers = (): ReadonlyArray<HouseholdMember> => {
  const ref = useContext(HouseholdMembersContext)
  if (ref === null) {
    throw new Error(
      'useHouseholdMembers must be used within a HouseholdMembersProvider',
    )
  }
  const data = useFragment(UseHouseholdMembersFragment, ref)
  return useMemo(
    () =>
      data.userHouseholds?.map((uh) => ({
        id: uh.user.id,
        name: uh.user.name,
        isSynthetic: uh.user.isSynthetic,
      })) ?? [],
    [data.userHouseholds],
  )
}
