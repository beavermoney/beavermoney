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
import {
  logTransactionStore,
  setLogTransactionType,
} from '@/hooks/log-transaction-store'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { identity } from 'lodash-es'
import { useEffect } from 'react'

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

  const { type: logType } = useLogTransaction()

  useEffect(() => {
    if (logTransactionStore.state.type === null) {
      setLogTransactionType('expense')
    }
    return () => {
      setLogTransactionType(null)
    }
  }, [])

  const isMobile = useIsMobile()
  if (!isMobile) {
    return <Navigate to=".." search={identity} />
  }

  if (logType === null) {
    return null
  }

  return (
    <div className="flex max-h-full w-full">
      <Item className="p-0">
        <LogTransaction fragmentRef={data.household} />
      </Item>
    </div>
  )
}
