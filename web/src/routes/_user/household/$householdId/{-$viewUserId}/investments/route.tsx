import { Outlet, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { GenericError } from '@/components/generic-error'

const SearchSchema = z.object({
  investments_group_by: z
    .enum(['account', 'symbol'])
    .optional()
    .default('account'),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/investments',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  errorComponent: GenericError,
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Outlet />
    </HouseholdContentLayout>
  )
}
