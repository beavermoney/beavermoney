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
  loaderDeps: ({ search }) => ({
    viewUserId:
      ((search as Record<string, unknown>).view_user_id as
        | string
        | null
        | undefined) ?? null,
  }),
  loader: ({ deps }) => {
    return loadQuery<subscriptionsQuery>(
      environment,
      query,
      { viewUserId: deps.viewUserId },
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const deps = Route.useLoaderDeps()

  const data = usePreloadedQuery<subscriptionsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      { viewUserId: deps.viewUserId },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <SubscriptionsPanel fragmentRef={data.household} />
}
