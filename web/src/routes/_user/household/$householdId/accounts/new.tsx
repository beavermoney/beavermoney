import { createFileRoute } from '@tanstack/react-router'
import { NewAccount } from './-components/new-account'
import { Item } from '@/components/ui/item'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-full">
      <div className="flex-1">
        <Item className="p-0">
          <NewAccount />
        </Item>
      </div>
    </div>
  )
}
