import { Outlet, createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import * as z from 'zod'
import { CategoriesPanel } from './-components/categories-panel'
import { HouseholdSplitPaneLayout } from '@/components/layouts/household-split-pane-layout'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { categoriesQuery } from './-categories-query'
import { type CategoriesQuery } from './__generated__/CategoriesQuery.graphql'
import {
  getDateRangeForPreset,
  DATE_RANGE_PRESETS,
  parseDateRangeFromURL,
} from '@/lib/date-range'
import { format } from 'date-fns'

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
  const params = Route.useParams()
  const search = Route.useSearch()
  const queryRef = Route.useRouteContext()

  const data = usePreloadedQuery<CategoriesQuery>(categoriesQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    const period = parseDateRangeFromURL(search.start, search.end)

    fetchQuery(environment, categoriesQuery, period, {
      fetchPolicy: 'network-only',
    }).subscribe({})
  })

  return (
    <HouseholdSplitPaneLayout
      left={<CategoriesPanel fragmentRef={data.household} />}
      right={<Outlet />}
      rightKey={location.pathname}
    />
  )
}
