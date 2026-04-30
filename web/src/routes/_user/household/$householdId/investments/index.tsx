import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { InvestmentsPanel } from './-components/investments-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import type { investmentsQuery } from './__generated__/investmentsQuery.graphql'

const query = graphql`
  query investmentsQuery($viewUserId: ID) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...investmentsPanelFragment @arguments(viewUserId: $viewUserId)
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({
    viewUserId: (search as { view_user_id?: string | null }).view_user_id,
  }),
  loader: ({ deps }) => {
    return loadQuery<investmentsQuery>(
      environment,
      query,
      { viewUserId: deps.viewUserId ?? null },
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const { viewUserId } = Route.useLoaderDeps()

  const data = usePreloadedQuery<investmentsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      { viewUserId: viewUserId ?? null },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <InvestmentsPanel fragmentRef={data.household} />
}
