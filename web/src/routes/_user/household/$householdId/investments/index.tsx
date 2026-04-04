import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { InvestmentsPanel } from './-components/investments-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { investmentsQuery } from './-investments-query'
import { InvestmentsQuery } from './__generated__/InvestmentsQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: () => {
    return loadQuery<InvestmentsQuery>(
      environment,
      investmentsQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<InvestmentsQuery>(investmentsQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      investmentsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <InvestmentsPanel fragmentRef={data.household} />
}
