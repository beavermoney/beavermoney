import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { categoriesQuery } from './-categories-query'
import { CategoriesQuery } from './__generated__/CategoriesQuery.graphql'
import { CategoriesPanel } from './-components/categories-panel'
import { parseDateRangeFromURL } from '@/lib/date-range'

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ deps: search }) => {
    const period = parseDateRangeFromURL(search.start, search.end)

    return loadQuery<CategoriesQuery>(environment, categoriesQuery, period, {
      fetchPolicy: 'store-or-network',
    })
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<CategoriesQuery>(categoriesQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    const period = parseDateRangeFromURL(search.start, search.end)

    fetchQuery(environment, categoriesQuery, period, {
      fetchPolicy: 'network-only',
    }).subscribe({})
  })

  return <CategoriesPanel fragmentRef={data.household} />
}
