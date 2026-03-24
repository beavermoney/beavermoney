import { createFileRoute } from '@tanstack/react-router'
import { usePreloadedQuery } from 'react-relay'
import { InvestmentsPanel } from './-components/investments-panel'
import { HouseholdMobileOnly } from '@/components/layouts/household-mobile-only'
import { PendingComponent } from '@/components/pending-component'
import { investmentsQuery } from './-investments-query'
import { InvestmentsQuery } from './__generated__/InvestmentsQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<InvestmentsQuery>(investmentsQuery, queryRef)

  return (
    <HouseholdMobileOnly className="flex h-full">
      <div className="flex-1">
        <InvestmentsPanel fragmentRef={data.household} />
      </div>
    </HouseholdMobileOnly>
  )
}
