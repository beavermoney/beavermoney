import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { MerchantsPanel } from './-components/merchants-panel'
import type { merchantsQuery } from './__generated__/merchantsQuery.graphql'

const query = graphql`
  query merchantsQuery(
    $startDate: Time!
    $endDate: Time!
    $viewUserIds: [ID!]
  ) {
    household {
      ...merchantsPanelFragment
        @arguments(
          startDate: $startDate
          endDate: $endDate
          viewUserIds: $viewUserIds
        )
    }
  }
`
export const Route = createFileRoute(
  '/_user/household/$householdId/merchants/',
)({
  component: RouteComponent,
  loaderDeps: ({ search }) => ({ start: search.start, end: search.end }),
  loader: ({ deps, params }) =>
    loadRouteQuery<merchantsQuery>(
      environment,
      query,
      {
        ...parseDateRangeFromURL(deps.start, deps.end),
        viewUserIds: readViewUserIds(params.householdId),
      },
      { fetchPolicy: 'store-or-network' },
    ),
})
function RouteComponent() {
  const { householdId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const data = usePreloadedQuery<merchantsQuery>(query, Route.useLoaderData())
  const variables = (start: string, end: string) => ({
    ...parseDateRangeFromURL(start, end),
    viewUserIds: readViewUserIds(householdId),
  })
  useSubscribeToInvalidationState([householdId], () => {
    fetchQuery(environment, query, variables(search.start, search.end), {
      fetchPolicy: 'network-only',
    }).subscribe({})
  })
  return (
    <HouseholdContentLayout>
      <MerchantsPanel
        fragmentRef={data.household}
        start={search.start}
        end={search.end}
        onDateRangeChange={async (start, end) => {
          await fetchQuery<merchantsQuery>(
            environment,
            query,
            variables(start, end),
            { fetchPolicy: 'network-only' },
          ).toPromise()
          await navigate({
            search: (previous) => ({ ...previous, start, end }),
            resetScroll: false,
          })
        }}
      />
    </HouseholdContentLayout>
  )
}
