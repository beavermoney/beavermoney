import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import * as z from 'zod'
import { TransactionsPanel } from './-components/transactions-panel'
import { HouseholdSplitPaneLayout } from '@/components/layouts/household-split-pane-layout'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { transactionsQuery } from './-transactions-query'
import { type TransactionsQuery } from './__generated__/TransactionsQuery.graphql'
import { parseDateRangeFromURL, getDefaultDates } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'

const defaults = getDefaultDates()

const SearchSchema = z.object({
  start: z.string().optional().default(defaults.start),
  end: z.string().optional().default(defaults.end),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
  beforeLoad: ({ search }) => {
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

  return (
    <HouseholdSplitPaneLayout
      left={<TransactionsPanel fragmentRef={data.household} />}
      right={<Outlet />}
    />
  )
}
