import { createFileRoute } from '@tanstack/react-router'
import { graphql, ROOT_ID } from 'relay-runtime'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { EditSubscription } from './-components/edit-subscription'
import { SubscriptionCard } from './-components/subscription-card'
import type { subscriptionIdQuery } from './__generated__/subscriptionIdQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/$subscriptionId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<subscriptionIdQuery>(
      environment,
      SubscriptionIdQuery,
      { id: params.subscriptionId },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const SubscriptionIdQuery = graphql`
  query SubscriptionIdQuery($id: ID!) {
    node(id: $id) {
      ... on RecurringSubscription {
        ...subscriptionCardFragment
        ...editSubscriptionFragment
      }
    }
  }
`

function RouteComponent() {
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<subscriptionIdQuery>(
    SubscriptionIdQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<subscriptionIdQuery>(
      environment,
      SubscriptionIdQuery,
      { id: Route.useParams().subscriptionId },
      { fetchPolicy: 'network-only' },
    )
  })

  if (!data.node) {
    return <div>Subscription not found</div>
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Item className="p-0">
        <SubscriptionCard fragmentRef={data.node} />
      </Item>
      <EditSubscription fragmentRef={data.node} />
    </div>
  )
}
