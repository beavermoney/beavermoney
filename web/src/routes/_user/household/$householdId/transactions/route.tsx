import { LayoutContent } from '@astryxdesign/core/Layout'
import { GenericError } from '@/components/generic-error'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { getDefaultDates } from '@/lib/date-range'
import {
  Outlet,
  useRouterState,
  createFileRoute,
  stripSearchParams,
} from '@tanstack/react-router'
import * as z from 'zod'

const defaults = getDefaultDates()

const SearchSchema = z.object({
  start: z.string().optional().default(defaults.start),
  end: z.string().optional().default(defaults.end),
})

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions',
)({
  component: RouteComponent,
  errorComponent: GenericError,
  validateSearch: SearchSchema,
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
})

function RouteComponent() {
  const isList = useRouterState({
    select: (state) =>
      state.location.pathname.replace(/\/$/, '').endsWith('/transactions'),
  })
  if (isList)
    return (
      <LayoutContent padding={0} isScrollable={false}>
        <Outlet />
      </LayoutContent>
    )
  return (
    <HouseholdContentLayout>
      <Outlet />
    </HouseholdContentLayout>
  )
}
