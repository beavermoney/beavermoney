import { createFileRoute } from '@tanstack/react-router'
import { NewCategory } from './-components/new-category'
import { PendingComponent } from '@/components/pending-component'
import { Item } from '@/components/ui/item'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/categories/new',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <div className="flex h-full">
        <div className="flex-1">
          <Item className="p-0">
            <NewCategory />
          </Item>
        </div>
      </div>
    </HouseholdContentLayout>
  )
}
