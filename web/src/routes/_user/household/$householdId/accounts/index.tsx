import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { AccountsPanel } from './-components/accounts-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { accountsQuery } from './-accounts-query'
import { AccountsQuery } from './__generated__/AccountsQuery.graphql'

export const Route = createFileRoute('/_user/household/$householdId/accounts/')(
  {
    component: RouteComponent,
    pendingComponent: PendingComponent,
    loader: () => {
      return loadQuery<AccountsQuery>(
        environment,
        accountsQuery,
        {},
        { fetchPolicy: 'store-or-network' },
      )
    },
  },
)

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<AccountsQuery>(accountsQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      accountsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <AccountsPanel fragmentRef={data.household} />
}
