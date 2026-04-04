import { Outlet, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

const SearchSchema = z.object({
  accounts_group_by: z.enum(['type', 'category']).optional().default('type'),
})

export const Route = createFileRoute('/_user/household/$householdId/accounts')({
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
