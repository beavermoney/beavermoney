import { handleHouseholdError } from '@/lib/auth'
import {
  Outlet,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import { z } from 'zod'

import { GenericError } from '@/components/generic-error'

const SearchSchema = z.object({
  accounts_group_by: z.enum(['type', 'category']).optional().default('type'),
  accounts_sort_by: z
    .enum(['value_desc', 'updated_desc', 'name_asc'])
    .optional()
    .default('value_desc'),
})

const defaultValues = {
  accounts_group_by: 'type' as const,
  accounts_sort_by: 'value_desc' as const,
}

export const Route = createFileRoute('/_user/household/$householdId/accounts')({
  component: RouteComponent,
  validateSearch: SearchSchema,
  errorComponent: GenericError,
  onError: handleHouseholdError,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
})

function RouteComponent() {
  return <Outlet />
}
