import { handleHouseholdError } from '@/lib/auth'
import { GenericError } from '@/components/generic-error'
import { DATE_RANGE_PRESETS, getDateRangeForPreset } from '@/lib/date-range'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { z } from 'zod'

const searchSchema = z.object({
  start: z
    .string()
    .default(() =>
      format(
        getDateRangeForPreset(DATE_RANGE_PRESETS.THIS_MONTH).startDate,
        'yyyy-MM-dd',
      ),
    ),
  end: z
    .string()
    .default(() =>
      format(
        getDateRangeForPreset(DATE_RANGE_PRESETS.THIS_MONTH).endDate,
        'yyyy-MM-dd',
      ),
    ),
})
export const Route = createFileRoute('/_user/household/$householdId/merchants')(
  {
    component: Outlet,
    validateSearch: searchSchema,
    errorComponent: GenericError,
    onError: handleHouseholdError,
  },
)
