import { Outlet, createFileRoute } from '@tanstack/react-router'
import * as z from 'zod'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { getDateRangeForPreset, DATE_RANGE_PRESETS } from '@/lib/date-range'
import { format } from 'date-fns'
import { GenericError } from '@/components/generic-error'

const getDefaultDates = () => {
  const range = getDateRangeForPreset(DATE_RANGE_PRESETS.THIS_MONTH)
  return {
    start: format(range.startDate, 'yyyy-MM-dd'),
    end: format(range.endDate, 'yyyy-MM-dd'),
  }
}

const defaults = getDefaultDates()

const SearchSchema = z.object({
  start: z.string().optional().default(defaults.start),
  end: z.string().optional().default(defaults.end),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/categories',
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
