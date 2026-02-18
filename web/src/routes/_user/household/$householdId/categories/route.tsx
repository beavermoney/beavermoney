import { Outlet, createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import * as z from 'zod'
import { CategoriesPanel } from './-components/categories-panel'
import { Separator } from '@/components/ui/separator'
import { environment } from '@/environment'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { ScrollArea } from '@/components/ui/scroll-area'
import { categoriesQuery } from './-categories-query'
import { type CategoriesQuery } from './__generated__/CategoriesQuery.graphql'
import {
  getDateRangeForPreset,
  DATE_RANGE_PRESETS,
  parseDateRangeFromURL,
} from '@/lib/date-range'
import { format } from 'date-fns'
import { ROOT_ID } from 'relay-runtime'

// Get default "This Month" dates
const getDefaultDates = () => {
  const range = getDateRangeForPreset(DATE_RANGE_PRESETS.THIS_MONTH)
  return {
    start: format(range.startDate, 'yyyy-MM-dd'),
    end: format(range.endDate, 'yyyy-MM-dd'),
  }
}

const defaults = getDefaultDates()

const SearchSchema = z.object({
  start: z.string().optional().default(defaults.start),
  end: z.string().optional().default(defaults.end),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/categories',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  beforeLoad: ({ search }) => {
    const period = parseDateRangeFromURL(search.start, search.end)

    return loadQuery<CategoriesQuery>(environment, categoriesQuery, period, {
      fetchPolicy: 'store-or-network',
    })
  },
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<CategoriesQuery>(categoriesQuery, queryRef)

  useSubscribeToInvalidationState([ROOT_ID], () => {
    const period = parseDateRangeFromURL(search.start, search.end)

    return loadQuery<CategoriesQuery>(environment, categoriesQuery, period, {
      fetchPolicy: 'network-only',
    })
  })

  const duelPaneDisplay = useDualPaneDisplay()

  return (
    <Fragment>
      {duelPaneDisplay ? (
        <div className="flex h-[calc(100vh-48px)]">
          <ScrollArea className="flex-1 overflow-y-auto p-4">
            <CategoriesPanel fragmentRef={data} />
          </ScrollArea>
          <Separator orientation="vertical" className="w-px" />
          <ScrollArea
            className="flex-1 overflow-y-auto p-4"
            key={location.pathname}
          >
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
