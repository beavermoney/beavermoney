import { createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'
import { TransactionsPanel } from './-components/transactions-panel'
import { HouseholdMobileOnly } from '@/components/layouts/household-mobile-only'
import { PendingComponent } from '@/components/pending-component'
import { transactionsQuery } from './-transactions-query'
import { type TransactionsQuery } from './__generated__/TransactionsQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<TransactionsQuery>(transactionsQuery, queryRef)

  return (
    <HouseholdMobileOnly className="flex h-full">
      <div className="flex-1">
        <TransactionsPanel fragmentRef={data.household} />
      </div>
    </HouseholdMobileOnly>
  )
}
