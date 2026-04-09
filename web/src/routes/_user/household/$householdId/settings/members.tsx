import { createFileRoute } from '@tanstack/react-router'
import { graphql } from 'relay-runtime'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import type { membersSettingsPageQuery } from './__generated__/membersSettingsPageQuery.graphql'
import { MembersSettings } from './-components/members-settings'

const query = graphql`
  query membersSettingsPageQuery {
    household {
      ...membersSettingsFragment
    }
    user {
      id
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/settings/members',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: () => {
    return loadQuery<membersSettingsPageQuery>(
      environment,
      query,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<membersSettingsPageQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <MembersSettings householdRef={data.household} userId={data.user.id} />
}
