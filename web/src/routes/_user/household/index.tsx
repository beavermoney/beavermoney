import { Navigate, createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { fetchQuery, graphql, ROOT_ID } from 'relay-runtime'
import type { householdIdQuery } from './__generated__/householdIdQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'

export const Route = createFileRoute('/_user/household/')({
  component: RouteComponent,
  loader: async () => {
    await fetchQuery<householdIdQuery>(
      environment,
      householdIdQuery,
      {},
    ).toPromise()
    return loadQuery<householdIdQuery>(
      environment,
      householdIdQuery,
      {},
      { fetchPolicy: 'store-only' },
    )
  },
  pendingComponent: PendingComponent,
})

const householdIdQuery = graphql`
  query householdIdQuery {
    households {
      id
    }
  }
`

function RouteComponent() {
  const queryRef = Route.useLoaderData()
  const data = usePreloadedQuery<householdIdQuery>(householdIdQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<householdIdQuery>(
      environment,
      householdIdQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  const householdId = localStorage.getItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY)

  if (householdId && data.households.some((h) => h.id === householdId)) {
    return <Navigate to={'/household/$householdId'} params={{ householdId }} />
  }

  if (data.households.length > 0) {
    localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, data.households[0].id)
    return (
      <Navigate
        to={'/household/$householdId'}
        params={{ householdId: data.households[0].id }}
      />
    )
  }

  return <Navigate to="/household/new" />
}
