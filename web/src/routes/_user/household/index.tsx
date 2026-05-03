import { Navigate, createFileRoute } from '@tanstack/react-router'
import { loadQuery, usePreloadedQuery } from 'react-relay'
import { graphql } from 'relay-runtime'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
import { householdQuery } from './__generated__/householdQuery.graphql'

const query = graphql`
  query householdQuery {
    households {
      id
    }
  }
`

export const Route = createFileRoute('/_user/household/')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: () => {
    return loadQuery<householdQuery>(
      environment,
      query,
      {},
      {
        fetchPolicy: 'store-or-network',
      },
    )
  },
})

function RouteComponent() {
  const queryRef = Route.useLoaderData()
  const data = usePreloadedQuery<householdQuery>(query, queryRef)

  const householdId = localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)

  if (householdId && data.households.some((h) => h.id === householdId)) {
    return (
      <Navigate
        to={'/household/$householdId/{-$viewUserId}'}
        params={{ householdId }}
      />
    )
  }

  if (data.households.length > 0) {
    localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, data.households[0].id)
    return (
      <Navigate
        to={'/household/$householdId/{-$viewUserId}'}
        params={{ householdId: data.households[0].id }}
      />
    )
  }

  return <Navigate to="/household/new" />
}
