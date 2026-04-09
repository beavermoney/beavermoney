import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import type { categoriesQuery } from './__generated__/categoriesQuery.graphql'
import { CategoriesPanel } from './-components/categories-panel'
import { parseDateRangeFromURL } from '@/lib/date-range'

const query = graphql`
  query categoriesQuery($startDate: Time!, $endDate: Time!) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...categoriesPanelFragment
        @arguments(startDate: $startDate, endDate: $endDate)
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ deps: search }) => {
    const period = parseDateRangeFromURL(search.start, search.end)

    return loadQuery<categoriesQuery>(environment, query, period, {
      fetchPolicy: 'store-or-network',
    })
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<categoriesQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    const period = parseDateRangeFromURL(search.start, search.end)

    fetchQuery(environment, query, period, {
      fetchPolicy: 'network-only',
    }).subscribe({})
  })

  return <CategoriesPanel fragmentRef={data.household} />
}
