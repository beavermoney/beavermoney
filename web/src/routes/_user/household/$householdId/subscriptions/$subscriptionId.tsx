import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { useBackNavigation } from '@/hooks/use-back-navigation'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { EditSubscription } from './-components/edit-subscription'

import invariant from 'tiny-invariant'
import { SubscriptionIdQuery } from './__generated__/SubscriptionIdQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/$subscriptionId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadRouteQuery<SubscriptionIdQuery>(
      environment,
      subscriptionIdQuery,
      { id: params.subscriptionId },
      { fetchPolicy: 'store-or-network' },
    )
  },
})

const subscriptionIdQuery = graphql`
  query SubscriptionIdQuery($id: ID!) {
    node(id: $id) {
      ... on RecurringSubscription {
        id
        ...editSubscriptionFragment
      }
    }
  }
`

function RouteComponent() {
  const { t } = useLingui()
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

  const goBack = useBackNavigation()

  invariant(data.node, t`Subscription not found`)

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() =>
            goBack({
              to: '/household/$householdId/subscriptions',
              params: { householdId: params.householdId },
              search: (previous) => previous,
            })
          }
          label={t`Back`}
          width="fit-content"
          variant={'secondary'}
        >
          <Trans>Back</Trans>
        </Button>
      </Stack>
      <Stack direction="vertical" gap={4} className="max-w-2xl">
        <EditSubscription key={data.node.id} fragmentRef={data.node} />
      </Stack>
    </Stack>
  )
}
