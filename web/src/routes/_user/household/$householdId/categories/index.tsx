import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { useDualPaneDisplay } from '@/hooks/use-screen-size'
import { PendingComponent } from '@/components/pending-component'
import { categoriesQuery } from './-categories-query'
import { CategoriesQuery } from './__generated__/CategoriesQuery.graphql'
import { CategoriesPanel } from './-components/categories-panel'
import { ROOT_ID } from 'relay-runtime'
import { environment } from '@/environment'
import { parseDateRangeFromURL } from '@/lib/date-range'

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/',
)({
  component: RouteComponent,
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

  if (duelPaneDisplay) {
    return null
  }

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <CategoriesPanel fragmentRef={data.household} />
      </div>
    </div>
  )
}
