import { Outlet, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { GenericError } from '@/components/generic-error'

const SearchSchema = z.object({
  accounts_group_by: z.enum(['type', 'category']).optional().default('type'),
})

export const Route = createFileRoute('/_user/household/$householdId/accounts')({
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
