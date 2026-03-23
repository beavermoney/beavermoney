import { createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'
import { AccountsPanel } from './-components/accounts-panel'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { accountsQuery } from './-accounts-query'
import { AccountsQuery } from './__generated__/AccountsQuery.graphql'
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

  const duelPaneDisplay = useDualPaneDisplay()

  if (duelPaneDisplay) {
    return null
  }

  return (
    <div className="flex max-h-full w-full">
      <Item className="flex p-0">
        <AccountsPanel fragmentRef={data.household} />
      </Item>
    </div>
  )
}
