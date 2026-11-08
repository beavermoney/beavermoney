import { MobileNav } from '@astryxdesign/core/MobileNav'
import { HStack, Layout } from '@astryxdesign/core/Layout'
import { Icon } from '@astryxdesign/core/Icon'
import { PanelLeft, Settings, CreditCard, Users } from 'lucide-react'
import { HouseholdSwitcher } from '@/components/household-switcher'
import { NAV } from '@/constant'
import { useHousehold } from '@/hooks/use-household'
import {
  SideNav,
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

const MAIN_NAV = NAV.filter((item) => item.name !== 'Settings')
const SETTINGS_NAV: React.ComponentProps<typeof NavProjects>['projects'] = [
  {
    name: 'General',
    icon: Settings,
    link: { to: '/household/$householdId/settings/general' },
    shortcut: ['G', ','],
  },
  {
    name: 'Accounts',
    icon: CreditCard,
    link: { to: '/household/$householdId/settings/accounts' },
  },
  {
    name: 'Members',
    icon: Users,
    link: { to: '/household/$householdId/settings/members' },
  },
]

function SidebarSections() {
  const { household } = useHousehold()
  return (
    <>
      <NavProjects title={household.name} projects={MAIN_NAV} />
      <NavProjects title="Settings" projects={SETTINGS_NAV} />
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
