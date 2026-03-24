import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { z } from 'zod'

import { HouseholdSplitPaneLayout } from '@/components/layouts/household-split-pane-layout'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'

import { SubscriptionsPanel } from './-components/subscriptions-panel'
import { subscriptionsQuery } from './-subscriptions-query'

import type { SubscriptionsQuery } from './__generated__/SubscriptionsQuery.graphql'

const SearchSchema = z.object({
  sort_by: z
    .enum(['cost_high', 'cost_low', 'next_payment', 'name_az', 'name_za'])
    .optional()
    .default('next_payment'),
})

const defaultValues = {
  sort_by: 'next_payment' as const,
}

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  beforeLoad: () => {
    return loadQuery<SubscriptionsQuery>(
      environment,
      subscriptionsQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<SubscriptionsQuery>(
    subscriptionsQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      subscriptionsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdSplitPaneLayout
      left={<SubscriptionsPanel fragmentRef={data.household} />}
      right={<Outlet />}
      rightKey={location.pathname}
    />
  )
}
