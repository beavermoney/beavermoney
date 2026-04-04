import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { TransactionsPanel } from './-components/transactions-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { transactionsQuery } from './-transactions-query'
import { type TransactionsQuery } from './__generated__/TransactionsQuery.graphql'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ deps: search }) => {
    const period = parseDateRangeFromURL(search.start, search.end)

    return loadQuery<TransactionsQuery>(
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
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()
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

  return <TransactionsPanel fragmentRef={data.household} />
}
