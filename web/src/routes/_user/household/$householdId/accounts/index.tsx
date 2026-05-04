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
import { readViewUserIds } from '@/hooks/view-scope-store'
import type { accountsQuery } from './__generated__/accountsQuery.graphql'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

const query = graphql`
  query accountsQuery($viewUserIds: [ID!]) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...accountsPanelFragment @arguments(viewUserIds: $viewUserIds)
    }
  }
`

export const Route = createFileRoute('/_user/household/$householdId/accounts/')(
  {
    component: RouteComponent,
    pendingComponent: PendingComponent,
    loader: ({ params }) => {
      return loadQuery<accountsQuery>(
        environment,
        query,
        { viewUserIds: readViewUserIds(params.householdId) },
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
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdContentLayout>
      <AccountsPanel fragmentRef={data.household} />
    </HouseholdContentLayout>
  )
}
