import { Outlet, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { GenericError } from '@/components/generic-error'

const SearchSchema = z.object({
  accounts_group_by: z.enum(['type', 'category']).optional().default('type'),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/accounts',
)({
  component: RouteComponent,
  validateSearch: SearchSchema,
  errorComponent: GenericError,
})

function RouteComponent() {
  return <Outlet />
}
