import { MobileNav } from '@astryxdesign/core/MobileNav'
import { HStack, Layout } from '@astryxdesign/core/Layout'
import { Icon } from '@astryxdesign/core/Icon'
import { PanelLeft } from 'lucide-react'
import { HouseholdSwitcher } from '@/components/household-switcher'
import { NAV } from '@/constant'
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

export function AppSidebar({ fragmentRef, ...props }: AppSidebarProps) {
  const data = useFragment(appSidebarFragment, fragmentRef)
  const renderMode = useSideNavRenderMode()

  if (renderMode === 'drawer') {
    return (
      <MobileNav>
        <Layout
          height="fill"
          content={<NavProjects projects={MAIN_NAV} />}
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
      <NavProjects projects={MAIN_NAV} />
    </SideNav>
  )
}
