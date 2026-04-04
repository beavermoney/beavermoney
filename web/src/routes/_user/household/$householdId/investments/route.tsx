import { Outlet, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

const SearchSchema = z.object({
  investments_group_by: z
    .enum(['account', 'symbol'])
    .optional()
    .default('account'),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/investments',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Outlet />
    </HouseholdContentLayout>
  )
}
