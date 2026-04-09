import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { settingsQuery } from './-settings-query'
import type { SettingsQuery } from './__generated__/SettingsQuery.graphql'
import { GeneralSettings } from './-components/general-settings'

export const Route = createFileRoute(
  '/_user/household/$householdId/settings/general',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: () => {
    return loadQuery<SettingsQuery>(
      environment,
      settingsQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const navigate = useNavigate()

  const data = usePreloadedQuery<SettingsQuery>(settingsQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      settingsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const currentUserHousehold = data.userHouseholds.find(
    (uh) => uh.user.id === data.user.id,
  )
  const isAdmin = currentUserHousehold?.role === 'admin'

  return (
    <GeneralSettings
      householdRef={data.household}
      isAdmin={isAdmin}
      onDeleted={() => navigate({ to: '/household' })}
    />
  )
}
