import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { environment } from '@/environment'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { AccountSettings } from './-components/account-settings'
import type { accountsSettingsQuery } from './__generated__/accountsSettingsQuery.graphql'

const query = graphql`
  query accountsSettingsQuery {
    household {
      id
    }
    ...accountSettingsFragment
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/settings/accounts',
)({
  component: RouteComponent,
  loader: () => {
    return loadRouteQuery<accountsSettingsQuery>(
      environment,
      query,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<accountsSettingsQuery>(query, queryRef)

  useSubscribeToInvalidationState([data.household.id], () => {
    fetchQuery(
      environment,
      query,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <AccountSettings fragmentRef={data} />
}
