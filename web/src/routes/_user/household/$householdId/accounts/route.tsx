import { Outlet, createFileRoute } from '@tanstack/react-router'

import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { AccountsPanel } from './-components/accounts-panel'
import { HouseholdSplitPaneLayout } from '@/components/layouts/household-split-pane-layout'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { accountsQuery } from './-accounts-query'
import { AccountsQuery } from './__generated__/AccountsQuery.graphql'

export const Route = createFileRoute('/_user/household/$householdId/accounts')({
  component: RouteComponent,
  beforeLoad: () => {
    return loadQuery<AccountsQuery>(
      environment,
      accountsQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<AccountsQuery>(accountsQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      accountsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdSplitPaneLayout
      left={<AccountsPanel fragmentRef={data.household} />}
      right={<Outlet />}
      rightKey={location.pathname}
    />
  )
}
