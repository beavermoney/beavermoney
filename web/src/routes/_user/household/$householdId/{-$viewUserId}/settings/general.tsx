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
import type { generalSettingsQuery } from './__generated__/generalSettingsQuery.graphql'
import { GeneralSettings } from './-components/general-settings'

const query = graphql`
  query generalSettingsQuery {
    household {
      ...generalSettingsHouseholdFragment
    }
    ...generalSettingsCurrenciesFragment
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/settings/general',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: () => {
    return loadQuery<generalSettingsQuery>(
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

  const data = usePreloadedQuery<generalSettingsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <GeneralSettings householdRef={data.household} currenciesRef={data} />
}
