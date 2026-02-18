import { createFileRoute } from '@tanstack/react-router'
import { graphql, ROOT_ID } from 'relay-runtime'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { NewSubscription } from './-components/new-subscription'
import type { newSubscriptionQuery } from './__generated__/newSubscriptionQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/new',
)({
  component: RouteComponent,
  loader: () => {
    return loadQuery<newSubscriptionQuery>(
      environment,
      newSubscriptionQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const newSubscriptionQuery = graphql`
  query newSubscriptionQuery {
    ...newSubscriptionFragment
  }
`

function RouteComponent() {
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<newSubscriptionQuery>(
    newSubscriptionQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<newSubscriptionQuery>(
      environment,
      newSubscriptionQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  return (
    <div className="flex h-full flex-col">
      <Item className="p-0">
        <NewSubscription fragmentRef={data} />
      </Item>
    </div>
  )
}
