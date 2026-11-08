import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute } from '@tanstack/react-router'
import { NewSubscription } from './-components/new-subscription'

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Stack direction="vertical">
      <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
        <NewSubscription />
      </Stack>
    </Stack>
  )
}
