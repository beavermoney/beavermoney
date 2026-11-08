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
    <Stack direction="vertical" width="100%" className="max-w-2xl">
      <NewSubscription />
    </Stack>
  )
}
