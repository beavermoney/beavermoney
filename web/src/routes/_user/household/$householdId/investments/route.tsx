import { Outlet, createFileRoute } from '@tanstack/react-router'
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

import { InvestmentsPanel } from './-components/investments-panel'
import { investmentsQuery } from './-investments-query'

import type { InvestmentsQuery } from './__generated__/InvestmentsQuery.graphql'

const SearchSchema = z.object({
  group_by: z.enum(['account', 'symbol']).optional().default('account'),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/investments',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  beforeLoad: () => {
    return loadQuery<InvestmentsQuery>(
      environment,
      investmentsQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<InvestmentsQuery>(investmentsQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      investmentsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdSplitPaneLayout
      left={<InvestmentsPanel fragmentRef={data.household} />}
      right={<Outlet />}
      rightKey={location.pathname}
    />
  )
}
