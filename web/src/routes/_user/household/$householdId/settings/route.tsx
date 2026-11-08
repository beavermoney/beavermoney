import { GenericError } from '@/components/generic-error'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { Heading } from '@astryxdesign/core/Heading'
import { Section } from '@astryxdesign/core/Section'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_user/household/$householdId/settings')({
  component: RouteComponent,
  errorComponent: GenericError,
})

function RouteComponent() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = pathname.split('/').at(-1) ?? 'general'
  return (
    <HouseholdContentLayout>
      <Heading level={1}>Household settings</Heading>
      <TabList
        aria-label="Settings"
        value={section}
        onChange={(value) => {
          void navigate({
            to:
              value === 'accounts'
                ? '/household/$householdId/settings/accounts'
                : value === 'members'
                  ? '/household/$householdId/settings/members'
                  : '/household/$householdId/settings/general',
            params,
          })
        }}
      >
        <Tab value="general" label="General" />
        <Tab value="accounts" label="Accounts" />
        <Tab value="members" label="Members" />
      </TabList>
      <Section>
        <Outlet />
      </Section>
    </HouseholdContentLayout>
  )
}
