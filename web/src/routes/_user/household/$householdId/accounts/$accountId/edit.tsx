import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql, ROOT_ID } from 'relay-runtime'
import type { editAccountQuery } from './__generated__/editAccountQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { EditAccount } from '../-components/edit-account'
import { Item } from '@/components/ui/item'
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

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<editAccountQuery>(
      environment,
      editAccountQuery,
      { id: params.accountId },
      { fetchPolicy: 'network-only' },
    )
  })

  invariant(data.node, 'Account not found')

  return (
    <Item className="p-0">
      <EditAccount key={data.node.id} fragmentRef={data.node} />
    </Item>
  )
}
