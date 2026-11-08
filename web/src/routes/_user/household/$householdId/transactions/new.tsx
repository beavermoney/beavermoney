import { PendingComponent } from '@/components/pending-component'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'

import { environment } from '@/environment'
import { logTransactionStore } from '@/hooks/log-transaction-store'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { useIsMobile } from '@/hooks/use-mobile'
import { readViewUserIds } from '@/hooks/view-scope-store'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { identity } from 'lodash-es'
import { useEffect } from 'react'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { LogTransaction } from './-components/log-transaction'
import { type newTransactionQuery } from './__generated__/newTransactionQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/new',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<newTransactionQuery>(
      environment,
      newTransactionQuery,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const newTransactionQuery = graphql`
  query newTransactionQuery($viewUserIds: [ID!]) {
    household {
      ...logTransactionFragment @arguments(viewUserIds: $viewUserIds)
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
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const { type: logType } = useLogTransaction()

  useEffect(() => {
    if (logTransactionStore.state.type === null) {
      logTransactionStore.setState(() => ({ type: 'expense' }))
    }
    return () => {
      logTransactionStore.setState(() => ({ type: null }))
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
    <Stack direction="vertical" gap={6} className="max-w-2xl" width="100%">
      <Heading level={1}>New transaction</Heading>
      <Stack direction="vertical" gap={4}>
        <LogTransaction fragmentRef={data.household} />
      </Stack>
    </Stack>
  )
}
