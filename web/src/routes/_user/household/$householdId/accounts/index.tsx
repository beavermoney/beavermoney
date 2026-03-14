import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { AccountsPanel } from './-components/accounts-panel'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { accountsQuery } from './-accounts-query'
import { AccountsQuery } from './__generated__/AccountsQuery.graphql'
import { ROOT_ID } from 'relay-runtime'
import { environment } from '@/environment'
import { Item } from '@/components/ui/item'

export const Route = createFileRoute('/_user/household/$householdId/accounts/')(
  {
    component: RouteComponent,
    pendingComponent: PendingComponent,
  },
)

function RouteComponent() {
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<AccountsQuery>(accountsQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<AccountsQuery>(
      environment,
      accountsQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  const duelPaneDisplay = useDualPaneDisplay()

  if (duelPaneDisplay) {
    return null
  }

  return (
    <div className="flex max-h-full w-full">
      <Item className="flex p-0">
        <AccountsPanel fragmentRef={data} />
      </Item>
    </div>
  )
}
