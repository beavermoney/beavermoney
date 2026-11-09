import { t } from '@lingui/core/macro'
import { RouteContentBoundary } from '@/components/route-content-boundary'
import { GenericError } from '@/components/generic-error'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { Heading } from '@astryxdesign/core/Heading'
import { VStack } from '@astryxdesign/core/Layout'
import { Section } from '@astryxdesign/core/Section'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/household/$householdId/settings')({
  component: RouteComponent,
  errorComponent: GenericError,
})

function RouteComponent() {
  const SETTINGS_HEADERS = {
    general: {
      title: t`General settings`,
    },
    accounts: {
      title: t`Account settings`,
    },
    members: {
      title: t`Members`,
    },
  }

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const section = pathname.split('/').filter(Boolean).at(-1)
  const header =
    SETTINGS_HEADERS[section as keyof typeof SETTINGS_HEADERS] ??
    SETTINGS_HEADERS.general
  return (
    <HouseholdContentLayout>
      <VStack gap={1}>
        <Heading level={1}>{header.title}</Heading>
      </VStack>
      <Section padding={6}>
        <RouteContentBoundary>
          <Outlet />
        </RouteContentBoundary>
      </Section>
    </HouseholdContentLayout>
  )
}
