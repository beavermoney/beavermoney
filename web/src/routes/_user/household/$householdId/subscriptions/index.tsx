import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { ROOT_ID } from 'relay-runtime'

import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'

import { SubscriptionsPanel } from './-components/subscriptions-panel'
import { subscriptionsQuery } from './-subscriptions-query'

import type { SubscriptionsQuery } from './__generated__/SubscriptionsQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<SubscriptionsQuery>(
    subscriptionsQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<SubscriptionsQuery>(
      environment,
      subscriptionsQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  const duelPaneDisplay = useDualPaneDisplay()

  if (duelPaneDisplay) {
    return null
  }

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <SubscriptionsPanel fragmentRef={data.household} />
      </div>
    </div>
  )
}
