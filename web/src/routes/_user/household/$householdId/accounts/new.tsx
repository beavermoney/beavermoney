import { createFileRoute } from '@tanstack/react-router'
import { graphql } from 'relay-runtime'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { NewAccount } from './-components/new-account'
import type { newAccountQuery } from './__generated__/newAccountQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/new',
)({
  component: RouteComponent,
  loader: () => {
    return loadQuery<newAccountQuery>(
      environment,
      newAccountQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const newAccountQuery = graphql`
  query newAccountQuery {
    ...newAccountFragment
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<newAccountQuery>(newAccountQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    return loadQuery<newAccountQuery>(
      environment,
      newAccountQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <Item className="p-0">
          <NewAccount fragmentRef={data} />
        </Item>
      </div>
    </div>
  )
}
