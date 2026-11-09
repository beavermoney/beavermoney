import { useLingui } from '@lingui/react/macro'
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
  const { t } = useLingui()
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

  invariant(data.node, t`Account not found`)

  return (
    <Stack direction="vertical" gap={4} className="max-w-2xl" width="100%">
      <EditAccount key={data.node.id} fragmentRef={data.node} />
    </Stack>
  )
}
