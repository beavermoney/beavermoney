import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { GeneralSettings } from './-components/general-settings'
import type { generalSettingsQuery } from './__generated__/generalSettingsQuery.graphql'

const query = graphql`
  query generalSettingsQuery {
    household {
      ...generalSettingsHouseholdFragment
    }
    ...generalSettingsCurrenciesFragment
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/settings/general',
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
