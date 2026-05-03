import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import * as z from 'zod'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { getDefaultDates } from '@/lib/date-range'
import { GenericError } from '@/components/generic-error'

const defaults = getDefaultDates()

const SearchSchema = z.object({
  start: z.string().optional().default(defaults.start),
  end: z.string().optional().default(defaults.end),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/transactions',
)({
  component: RouteComponent,
  errorComponent: GenericError,
  validateSearch: SearchSchema,
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
})

function RouteComponent() {
  return (
    <HouseholdContentLayout>
      <Outlet />
    </HouseholdContentLayout>
  )
}
