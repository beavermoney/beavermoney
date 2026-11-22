import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'

import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'

import { SubscriptionsPanel } from './-components/subscriptions-panel'

import type { subscriptionsQuery } from './__generated__/subscriptionsQuery.graphql'

const query = graphql`
  query subscriptionsQuery($viewUserIds: [ID!]) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...subscriptionsPanelFragment @arguments(viewUserIds: $viewUserIds)
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadRouteQuery<subscriptionsQuery>(
      environment,
      query,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<subscriptionsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <SubscriptionsPanel fragmentRef={data.household} />
}
