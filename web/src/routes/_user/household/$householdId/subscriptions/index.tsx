import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'

import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'

import { SubscriptionsPanel } from './-components/subscriptions-panel'

import type { subscriptionsQuery } from './__generated__/subscriptionsQuery.graphql'

const query = graphql`
  query subscriptionsQuery($viewUserId: ID) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...subscriptionsPanelFragment @arguments(viewUserId: $viewUserId)
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: ({ params }) => {
    return loadQuery<subscriptionsQuery>(
      environment,
      query,
      { viewUserId: readViewUserIds(params.householdId)?.[0] ?? null },
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
      { viewUserId: readViewUserIds(params.householdId)?.[0] ?? null },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <SubscriptionsPanel fragmentRef={data.household} />
}
