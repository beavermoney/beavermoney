import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { AccountsPanel } from './-components/accounts-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import type { accountsQuery } from './__generated__/accountsQuery.graphql'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

const query = graphql`
  query accountsQuery {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...accountsPanelFragment
    }
  }
`

export const Route = createFileRoute('/_user/household/$householdId/accounts/')(
  {
    component: RouteComponent,
    pendingComponent: PendingComponent,
    loader: () => {
      return loadQuery<accountsQuery>(
        environment,
        query,
        {},
        { fetchPolicy: 'store-or-network' },
      )
    },
  },
)

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<accountsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdContentLayout>
      <AccountsPanel fragmentRef={data.household} />
    </HouseholdContentLayout>
  )
}
