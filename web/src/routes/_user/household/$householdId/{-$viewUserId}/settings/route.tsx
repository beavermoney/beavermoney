import {
  Outlet,
  createFileRoute,
  Link,
  linkOptions,
} from '@tanstack/react-router'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { identity } from 'lodash-es'
import { GenericError } from '@/components/generic-error'

const SETTINGS_NAV = [
  {
    label: 'General',
    ...linkOptions({
      from: '/household/$householdId/{-$viewUserId}/settings',
      to: './general',
      search: identity,
      activeOptions: { exact: true, includeSearch: false },
    }),
  },
  {
    label: 'Members',
    ...linkOptions({
      from: '/household/$householdId/{-$viewUserId}/settings',
      to: './members',
      search: identity,
      activeOptions: { exact: true, includeSearch: false },
    }),
  },
]

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/settings',
)({
  component: RouteComponent,
  errorComponent: GenericError,
})

function RouteComponent() {
  const isMobile = useIsMobile()
  const params = Route.useParams()

  return (
    <HouseholdContentLayout className="max-w-3xl">
      {isMobile ? (
        <div className="flex flex-col gap-4">
          <nav className="border-b pb-2">
            <div className="flex gap-1">
              {SETTINGS_NAV.map(({ label, ...linkProps }) => (
                <Link
                  {...linkProps}
                  key={label}
                  params={params}
                  className={cn(
                    'text-muted-foreground rounded-md px-2.5 py-1 text-xs/relaxed font-medium transition-colors',
                    '',
                  )}
                  activeProps={{
                    className: 'bg-muted font-semibold',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
          <Outlet />
        </div>
      ) : (
        <div className="grid grid-cols-[120px_1fr] gap-10">
          <nav className="flex flex-col gap-0.5 border-r pt-px pr-6">
            {SETTINGS_NAV.map(({ label, ...linkProps }) => (
              <Link
                {...linkProps}
                key={label}
                params={params}
                className={cn(
                  'text-muted-foreground -ml-px border-l-2 border-transparent py-0.5 pl-2.5 text-xs/relaxed font-medium transition-colors',
                  '',
                )}
                activeProps={{
                  className: 'font-semibold border-l-primary',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      )}
    </HouseholdContentLayout>
  )
}
