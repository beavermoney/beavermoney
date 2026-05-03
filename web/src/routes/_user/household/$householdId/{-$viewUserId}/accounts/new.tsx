import { createFileRoute } from '@tanstack/react-router'
import { NewAccount } from './-components/new-account'
import { Item } from '@/components/ui/item'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/accounts/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <div className="flex h-full">
        <div className="flex-1">
          <Item className="p-0">
            <NewAccount />
          </Item>
        </div>
      </div>
    </HouseholdContentLayout>
  )
}
