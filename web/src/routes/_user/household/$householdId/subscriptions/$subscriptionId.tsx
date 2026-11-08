import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { EditSubscription } from './-components/edit-subscription'
import { SubscriptionCard } from './-components/subscription-card'

import { identity } from 'lodash-es'
import invariant from 'tiny-invariant'
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
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() => navigate({ to: '..', search: identity })}
          label={'Back'}
          variant={'secondary'}
        >
          Back
        </Button>
      </Stack>
      <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
        <SubscriptionCard fragmentRef={data.node} />
        <EditSubscription key={data.node.id} fragmentRef={data.node} />
      </Stack>
    </Stack>
  )
}
