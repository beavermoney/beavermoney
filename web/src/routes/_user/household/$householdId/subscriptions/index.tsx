import { createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'

import { HouseholdMobileOnly } from '@/components/layouts/household-mobile-only'
import { PendingComponent } from '@/components/pending-component'

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

  return (
    <HouseholdMobileOnly className="flex h-full">
      <div className="flex-1">
        <SubscriptionsPanel fragmentRef={data.household} />
      </div>
    </HouseholdMobileOnly>
  )
}
