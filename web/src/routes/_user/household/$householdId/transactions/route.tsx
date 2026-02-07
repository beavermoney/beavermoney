import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import * as z from 'zod'
import { TransactionsPanel } from './-components/transactions-panel'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { Separator } from '@/components/ui/separator'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { ScrollArea } from '@/components/ui/scroll-area'
import { transactionsQuery } from './-transactions-query'
import { type TransactionsQuery } from './__generated__/TransactionsQuery.graphql'
import { parseDateRangeFromURL, getDefaultDates } from '@/lib/date-range'
import { zodValidator } from '@tanstack/zod-adapter'
import { ROOT_ID } from 'relay-runtime'

const defaults = getDefaultDates()

const SearchSchema = z.object({
  start: z.string().optional().default(defaults.start),
  end: z.string().optional().default(defaults.end),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions',
)({
  component: RouteComponent,
  validateSearch: zodValidator(SearchSchema),
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

  const data = usePreloadedQuery<TransactionsQuery>(transactionsQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
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
      { fetchPolicy: 'network-only' },
    )
  })

  const duelPaneDisplay = useDualPaneDisplay()

  return (
    <Fragment>
      {duelPaneDisplay ? (
        <div className="flex h-[calc(100vh-48px)]">
          <ScrollArea className="flex-1 overflow-y-auto p-4">
            <TransactionsPanel fragmentRef={data} />
          </ScrollArea>
          <Separator orientation="vertical" className="w-px" />
          <ScrollArea className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      )}
    </Fragment>
  )
}
