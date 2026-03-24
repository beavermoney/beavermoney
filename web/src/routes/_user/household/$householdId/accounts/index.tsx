import { createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'
import { AccountsPanel } from './-components/accounts-panel'
import { HouseholdMobileOnly } from '@/components/layouts/household-mobile-only'
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

  return (
    <HouseholdMobileOnly className="flex max-h-full w-full">
      <Item className="flex p-0">
        <AccountsPanel fragmentRef={data.household} />
      </Item>
    </HouseholdMobileOnly>
  )
}
