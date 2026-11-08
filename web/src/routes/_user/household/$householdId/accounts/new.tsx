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
      <Stack direction="vertical" width="100%" className="max-w-2xl">
        <NewAccount />
      </Stack>
    </HouseholdContentLayout>
  )
}
