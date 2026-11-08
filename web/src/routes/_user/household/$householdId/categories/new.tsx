import { PendingComponent } from '@/components/pending-component'
import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute } from '@tanstack/react-router'
import { NewCategory } from './-components/new-category'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute(
  '/_user/household/$householdId/categories/new',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Stack direction="horizontal">
        <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
          <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
            <NewCategory />
          </Stack>
        </Stack>
      </Stack>
    </HouseholdContentLayout>
  )
}
