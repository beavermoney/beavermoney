import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute } from '@tanstack/react-router'
import { NewAccount } from './-components/new-account'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Stack direction="horizontal">
        <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
          <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
            <NewAccount />
          </Stack>
        </Stack>
      </Stack>
    </HouseholdContentLayout>
  )
}
