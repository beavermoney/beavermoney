import { Navigate, createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'
import { PendingComponent } from '@/components/pending-component'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
import { HouseholdQuery } from './__generated__/HouseholdQuery.graphql'
import { householdQuery } from './-household-query'

export const Route = createFileRoute('/_user/household/')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useRouteContext()
  const data = usePreloadedQuery<HouseholdQuery>(householdQuery, queryRef)

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
