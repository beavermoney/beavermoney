import { ChevronsUpDown, Plus } from 'lucide-react'

import { Logo } from '@/components/logo'
import { graphql, useFragment } from 'react-relay'
import { useNavigate } from '@tanstack/react-router'
import type { householdSwitcherFragment$key } from './__generated__/householdSwitcherFragment.graphql'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useHousehold } from '@/hooks/use-household'

const HouseholdSwitcherFragment = graphql`
  fragment householdSwitcherFragment on Query {
    households {
      id
      name
    }
  }
`

type HouseholdSwitcherProps = {
  fragmentRef: householdSwitcherFragment$key
}

export function HouseholdSwitcher({ fragmentRef }: HouseholdSwitcherProps) {
  const { isMobile } = useSidebar()
  const data = useFragment(HouseholdSwitcherFragment, fragmentRef)
  const { household: activeHousehold } = useHousehold()
  const navigate = useNavigate()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                  <Logo size={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeHousehold.name}
                  </span>
                  {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Teams
              </DropdownMenuLabel>
              {data.households.map((household, index) => (
                <DropdownMenuItem
                  key={household.id}
                  className="gap-2 p-2"
                  onClick={() =>
                    navigate({
                      to: '/household/$householdId',
                      params: {
                        householdId: household.id,
                      },
                      reloadDocument: true,
                    })
                  }
                >
                  <div className="flex size-6 items-center justify-center rounded-md border text-sm">
                    {household.name[0]}
                  </div>
                  {household.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => navigate({ to: '/household/new' })}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add household
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
