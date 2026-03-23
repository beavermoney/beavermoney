import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { InvestmentsPanel } from './-components/investments-panel'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { investmentsQuery } from './-investments-query'
import { InvestmentsQuery } from './__generated__/InvestmentsQuery.graphql'
import { ROOT_ID } from 'relay-runtime'
import { environment } from '@/environment'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<InvestmentsQuery>(investmentsQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<InvestmentsQuery>(
      environment,
      investmentsQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  const duelPaneDisplay = useDualPaneDisplay()

  if (duelPaneDisplay) {
    return null
  }

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <InvestmentsPanel fragmentRef={data.household} />
      </div>
    </div>
  )
}
