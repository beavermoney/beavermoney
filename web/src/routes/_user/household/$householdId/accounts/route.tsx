import { Outlet, createFileRoute } from '@tanstack/react-router'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute('/_user/household/$householdId/accounts')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Outlet />
    </HouseholdContentLayout>
  )
}
