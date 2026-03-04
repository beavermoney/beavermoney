import { ChevronsUpDown, LogOut } from 'lucide-react'

import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { logout } from '@/lib/auth'
import { graphql } from 'relay-runtime'
import { navUserFragment$key } from './__generated__/navUserFragment.graphql'
import { useFragment } from 'react-relay'

const NavUserFragment = graphql`
  fragment navUserFragment on Query {
    user {
      name
      email
    }
  }
`

export function NavUser({ fragmentRef }: { fragmentRef: navUserFragment$key }) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const data = useFragment(NavUserFragment, fragmentRef)

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
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={''} alt={data.user.name.slice(0, 2)} />
                  <AvatarFallback className="rounded-lg">
                    {data.user.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{data.user.name}</span>
                  <span className="truncate text-xs">{data.user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={''} alt={data.user.name.slice(0, 2)} />
                    <AvatarFallback className="rounded-lg">
                      {data.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {data.user.name}
                    </span>
                    <span className="truncate text-xs">{data.user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup> */}
            {/*   <DropdownMenuItem> */}
            {/*     <Sparkles /> */}
            {/*     Upgrade to Pro */}
            {/*   </DropdownMenuItem> */}
            {/* </DropdownMenuGroup> */}
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuGroup> */}
            {/*   <DropdownMenuItem> */}
            {/*     <BadgeCheck /> */}
            {/*     Account */}
            {/*   </DropdownMenuItem> */}
            {/*   <DropdownMenuItem> */}
            {/*     <CreditCard /> */}
            {/*     Billing */}
            {/*   </DropdownMenuItem> */}
            {/*   <DropdownMenuItem> */}
            {/*     <Bell /> */}
            {/*     Notifications */}
            {/*   </DropdownMenuItem> */}
            {/* </DropdownMenuGroup> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate({ to: '/' })
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
