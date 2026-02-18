import { createFileRoute } from '@tanstack/react-router'
import { graphql, ROOT_ID } from 'relay-runtime'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { EditSubscription } from './-components/edit-subscription'
import { SubscriptionCard } from './-components/subscription-card'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'
import { SubscriptionIdQuery } from './__generated__/SubscriptionIdQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/$subscriptionId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<SubscriptionIdQuery>(
      environment,
      subscriptionIdQuery,
      { id: params.subscriptionId },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const subscriptionIdQuery = graphql`
  query SubscriptionIdQuery($id: ID!) {
    node(id: $id) {
      ... on RecurringSubscription {
        id
        ...subscriptionCardFragment
        ...editSubscriptionFragment
      }
    }
    ...editSubscriptionCurrenciesFragment
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<SubscriptionIdQuery>(
    subscriptionIdQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<SubscriptionIdQuery>(
      environment,
      subscriptionIdQuery,
      { id: params.subscriptionId },
      { fetchPolicy: 'network-only' },
    )
  })

  if (!data.node) {
    return <div>Subscription not found</div>
  }

  return (
    <div className="flex h-full flex-col">
      <Item className="p-0">
        <SubscriptionCard fragmentRef={data.node} />
        <EditSubscription
          key={data.node.id}
          fragmentRef={data.node}
          currenciesRef={data}
        />
      </Item>
    </div>
  )
}
