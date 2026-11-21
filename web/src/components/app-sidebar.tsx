import { preserveHistoryViewKey } from '@/lib/history-view-key'
import { useLingui } from '@lingui/react/macro'
import { useAppShellMobile } from '@astryxdesign/core/AppShell'
import { useNavigate } from '@tanstack/react-router'
import { MobileNav } from '@astryxdesign/core/MobileNav'
import { HStack, Layout } from '@astryxdesign/core/Layout'
import { Icon } from '@astryxdesign/core/Icon'
import { PanelLeft, Settings, CreditCard, Users, Search } from 'lucide-react'
import { HouseholdSwitcher } from '@/components/household-switcher'
import { NAV } from '@/constant'
import { useHousehold } from '@/hooks/use-household'
import {
  SideNav,
  SideNavItem,
  SideNavSection,
  SideNavCollapseButton,
  useSideNavRenderMode,
} from '@astryxdesign/core/SideNav'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import { appSidebarFragment$key } from './__generated__/appSidebarFragment.graphql'
import { NavProjects } from './nav-projects'

type AppSidebarProps = {
  fragmentRef: appSidebarFragment$key
} & Omit<React.ComponentProps<typeof SideNav>, 'children'>

const appSidebarFragment = graphql`
  fragment appSidebarFragment on Query {
    ...householdSwitcherFragment
  }
`

const MAIN_NAV = NAV.filter(
  (item) =>
    item.link.to !== '/household/$householdId/settings' &&
    item.link.to !== '/household/$householdId/subscriptions' &&
    item.link.to !== '/household/$householdId/categories' &&
    item.link.to !== '/household/$householdId/merchants',
)

const INSIGHTS_NAV = NAV.filter(
  (item) =>
    item.link.to === '/household/$householdId/categories' ||
    item.link.to === '/household/$householdId/merchants',
)

const TOOLS_NAV = NAV.filter(
  (item) => item.link.to === '/household/$householdId/subscriptions',
)

function SidebarSections() {
  const { t, i18n } = useLingui()
  const navigate = useNavigate()
  const { closeMobileNav } = useAppShellMobile()
  const SETTINGS_NAV: React.ComponentProps<typeof NavProjects>['projects'] = [
    {
      name: t`General`,
      icon: Settings,
      link: { to: '/household/$householdId/settings/general' },
      shortcut: ['G', ','],
    },
    {
      name: t`Accounts`,
      icon: CreditCard,
      link: { to: '/household/$householdId/settings/accounts' },
    },
    {
      name: t`Members`,
      icon: Users,
      link: { to: '/household/$householdId/settings/members' },
    },
  ]

  const { household } = useHousehold()
  return (
    <>
      <SideNavSection title={t`Search`} isHeaderHidden>
        <SideNavItem
          label={t`Search`}
          icon={Search}
          onClick={() => {
            closeMobileNav()
            void navigate({
              to: '.',
              search: (previous) => ({ ...previous, command_open: true }),
              replace: true,
              state: preserveHistoryViewKey,
              resetScroll: false,
            })
          }}
        />
      </SideNavSection>
      <NavProjects
        title={household.name}
        projects={MAIN_NAV.map((item) => ({
          ...item,
          name: i18n._(item.name),
        }))}
      />
      <NavProjects
        title={t`Insights`}
        projects={INSIGHTS_NAV.map((item) => ({
          ...item,
          name: i18n._(item.name),
        }))}
      />
      <NavProjects
        title={t`Tools`}
        projects={TOOLS_NAV.map((item) => ({
          ...item,
          name: i18n._(item.name),
        }))}
      />
      <NavProjects title={t`Settings`} projects={SETTINGS_NAV} />
    </>
  )
}

export function AppSidebar({ fragmentRef, ...props }: AppSidebarProps) {
  const data = useFragment(appSidebarFragment, fragmentRef)
  const renderMode = useSideNavRenderMode()

  if (renderMode === 'drawer') {
    return (
      <MobileNav className="app-mobile-nav">
        <Layout
          height="fill"
          content={<SidebarSections />}
          footer={<HouseholdSwitcher fragmentRef={data} />}
        />
      </MobileNav>
    )
  }

  return (
    <SideNav
      {...props}
      collapsible={{ hasButton: false }}
      header={
        <HStack hAlign="start">
          <SideNavCollapseButton>
            <Icon icon={PanelLeft} />
          </SideNavCollapseButton>
        </HStack>
      }
      footer={<HouseholdSwitcher fragmentRef={data} />}
    >
      <SidebarSections />
    </SideNav>
  )
}
