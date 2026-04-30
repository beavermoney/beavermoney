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
  query accountsQuery($viewUserId: ID) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...accountsPanelFragment @arguments(viewUserId: $viewUserId)
    }
  }
`

export const Route = createFileRoute('/_user/household/$householdId/accounts/')(
  {
    component: RouteComponent,
    pendingComponent: PendingComponent,
    loaderDeps: ({ search }) => ({
      viewUserId:
        ((search as Record<string, unknown>).view_user_id as
          | string
          | null
          | undefined) ?? null,
    }),
    loader: ({ deps }) => {
      return loadQuery<accountsQuery>(
        environment,
        query,
        { viewUserId: deps.viewUserId },
        { fetchPolicy: 'store-or-network' },
      )
    },
  },
)

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const deps = Route.useLoaderDeps()

  const data = usePreloadedQuery<accountsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      { viewUserId: deps.viewUserId },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdContentLayout>
      <AccountsPanel fragmentRef={data.household} />
    </HouseholdContentLayout>
  )
}
