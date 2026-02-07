import { zodValidator } from '@tanstack/zod-adapter'
import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import { ROOT_ID } from 'relay-runtime'
import { z } from 'zod'

import { PendingComponent } from '@/components/pending-component'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { environment } from '@/environment'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'

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
  validateSearch: zodValidator(SearchSchema),
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

  return (
    <Fragment>
      {duelPaneDisplay ? (
        <div className="flex h-[calc(100vh-48px)]">
          <ScrollArea className="flex-1 overflow-y-auto p-4">
            <SubscriptionsPanel fragmentRef={data} />
          </ScrollArea>
          <Separator orientation="vertical" className="w-px" />
          <ScrollArea
            className="flex-1 overflow-y-auto p-4"
            key={location.pathname}
          >
            <Outlet />
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      )}
    </Fragment>
  )
}
