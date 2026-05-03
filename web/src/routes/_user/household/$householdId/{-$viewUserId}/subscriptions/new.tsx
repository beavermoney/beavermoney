import { createFileRoute } from '@tanstack/react-router'
import { NewSubscription } from './-components/new-subscription'
import { Item } from '@/components/ui/item'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/subscriptions/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-full flex-col">
      <Item className="p-0">
        <NewSubscription />
      </Item>
    </div>
  )
}
