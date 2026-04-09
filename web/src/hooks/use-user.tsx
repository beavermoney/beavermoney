import { createContext, useContext } from 'react'
import { graphql, useFragment } from 'react-relay'
import type { useUserFragment$key } from './__generated__/useUserFragment.graphql'

const UseUserFragment = graphql`
  fragment useUserFragment on User {
    # eslint-disable-next-line relay/unused-fields
    id
    # eslint-disable-next-line relay/unused-fields
    name
    # eslint-disable-next-line relay/unused-fields
    email
  }
`

const UserContext = createContext<useUserFragment$key | null>(null)

export const UserProvider = ({
  children,
  userRef,
}: {
  children: React.ReactNode
  userRef: useUserFragment$key
}) => {
  return <UserContext.Provider value={userRef}>{children}</UserContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const ref = useContext(UserContext)
  if (ref === null) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return useFragment(UseUserFragment, ref)
}
