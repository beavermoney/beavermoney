import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { EditAccount } from '../-components/edit-account'
import type { editAccountQuery } from './__generated__/editAccountQuery.graphql'

import invariant from 'tiny-invariant'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/$accountId/edit',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<editAccountQuery>(
      environment,
      editAccountQuery,
      { id: params.accountId },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const editAccountQuery = graphql`
  query editAccountQuery($id: ID!) {
    node(id: $id) {
      ... on Account {
        id
        ...editAccountFragment
      }
    }
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<editAccountQuery>(editAccountQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      editAccountQuery,
      { id: params.accountId },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  invariant(data.node, 'Account not found')

  return (
    <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
      <EditAccount key={data.node.id} fragmentRef={data.node} />
    </Stack>
  )
}
