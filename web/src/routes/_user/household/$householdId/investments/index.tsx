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
  query investmentsQuery {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...investmentsPanelFragment
    }
  }
`

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: () => {
    return loadQuery<investmentsQuery>(
      environment,
      query,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<investmentsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <InvestmentsPanel fragmentRef={data.household} />
}
