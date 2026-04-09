import { createFileRoute } from '@tanstack/react-router'
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
import { MembersSettings } from './-components/members-settings'

export const Route = createFileRoute(
  '/_user/household/$householdId/settings/members',
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

  const data = usePreloadedQuery<SettingsQuery>(settingsQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      settingsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <MembersSettings householdRef={data.household} userId={data.user.id} />
}
