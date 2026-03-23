import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { TransactionsPanel } from './-components/transactions-panel'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { transactionsQuery } from './-transactions-query'
import { type TransactionsQuery } from './__generated__/TransactionsQuery.graphql'
import { environment } from '@/environment'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryRef = Route.useRouteContext()
  const { household } = useHousehold()

  const data = usePreloadedQuery<TransactionsQuery>(transactionsQuery, queryRef)

  useSubscribeToInvalidationState([household.id], () => {
    const period = parseDateRangeFromURL(search.start, search.end)

    fetchQuery(
      environment,
      transactionsQuery,
      {
        where: {
          datetimeGTE: period.startDate,
          datetimeLT: period.endDate,
        },
        startDate: period.startDate,
        endDate: period.endDate,
      },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const duelPaneDisplay = useDualPaneDisplay()

  if (duelPaneDisplay) {
    return null
  }

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <TransactionsPanel fragmentRef={data.household} />
      </div>
    </div>
  )
}
