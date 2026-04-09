import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { TransactionsPanel } from './-components/transactions-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import type { transactionsQuery } from './__generated__/transactionsQuery.graphql'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'

const query = graphql`
  query transactionsQuery(
    $where: TransactionWhereInput
    $startDate: Time!
    $endDate: Time!
  ) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...transactionsPanelFragment
        @arguments(where: $where, startDate: $startDate, endDate: $endDate)
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ deps: search }) => {
    const period = parseDateRangeFromURL(search.start, search.end)

    return loadQuery<transactionsQuery>(
      environment,
      query,
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

  const data = usePreloadedQuery<transactionsQuery>(query, queryRef)

  useSubscribeToInvalidationState([household.id], () => {
    const period = parseDateRangeFromURL(search.start, search.end)

    fetchQuery(
      environment,
      query,
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
