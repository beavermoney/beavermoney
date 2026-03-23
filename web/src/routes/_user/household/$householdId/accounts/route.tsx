import { Outlet, createFileRoute } from '@tanstack/react-router'

import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import { AccountsPanel } from './-components/accounts-panel'
import { Separator } from '@/components/ui/separator'
import { environment } from '@/environment'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    return loadQuery<AccountsQuery>(
      environment,
      accountsQuery,
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
            <AccountsPanel fragmentRef={data.household} />
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
