import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import { z } from 'zod'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { GenericError } from '@/components/generic-error'

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
  '/_user/household/$householdId/{-$viewUserId}/subscriptions',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  errorComponent: GenericError,
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
