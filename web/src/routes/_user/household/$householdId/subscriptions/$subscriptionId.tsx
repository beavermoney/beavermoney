import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { graphql } from 'relay-runtime'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { EditSubscription } from './-components/edit-subscription'
import { SubscriptionCard } from './-components/subscription-card'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { SubscriptionIdQuery } from './__generated__/SubscriptionIdQuery.graphql'
import invariant from 'tiny-invariant'

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
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<SubscriptionIdQuery>(
    subscriptionIdQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      subscriptionIdQuery,
      { id: params.subscriptionId },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const navigate = useNavigate()

  invariant(data.node, 'Subscription not found')

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => navigate({ to: '..' })}>
          Back
        </Button>
      </div>
      <Item className="p-0">
        <SubscriptionCard fragmentRef={data.node} />
        <EditSubscription key={data.node.id} fragmentRef={data.node} />
      </Item>
    </div>
  )
}
