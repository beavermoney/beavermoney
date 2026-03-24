import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'
import { environment } from '@/environment'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { LogTransaction } from './-components/log-transaction'
import { type newTransactionQuery } from './__generated__/newTransactionQuery.graphql'
import { useIsMobile } from '@/hooks/use-mobile'
import { identity } from 'lodash-es'

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/new',
)({
  component: RouteComponent,
  loader: () => {
    return loadQuery<newTransactionQuery>(
      environment,
      newTransactionQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const newTransactionQuery = graphql`
  query newTransactionQuery {
    household {
      ...logTransactionFragment
    }
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<newTransactionQuery>(
    newTransactionQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      newTransactionQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const isMobile = useIsMobile()
  if (!isMobile) {
    return <Navigate to=".." search={identity} />
  }

  return (
    <div className="flex max-h-full w-full">
      <Item className="p-0">
        <LogTransaction fragmentRef={data.household} />
      </Item>
    </div>
  )
}
