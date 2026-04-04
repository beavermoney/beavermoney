import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import { z } from 'zod'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

const SearchSchema = z.object({
  sort_by: z
    .enum(['cost_high', 'cost_low', 'next_payment', 'name_az', 'name_za'])
    .optional()
    .default('next_payment'),
})

const defaultValues = {
  sort_by: 'next_payment' as const,
}

export const Route = createFileRoute(
  '/_user/household/$householdId/subscriptions',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Outlet />
    </HouseholdContentLayout>
  )
}
