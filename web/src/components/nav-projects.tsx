// import { Folder, Forward, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { LinkOptions } from '@tanstack/react-router'
import type { HotkeySequence } from '@tanstack/react-hotkeys'
import type { LucideIcon } from 'lucide-react'

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  // SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  // useSidebar,
} from '@/components/ui/sidebar'
import { Kbd, KbdGroup } from './ui/kbd'

export function NavProjects({
  projects,
}: {
  projects: Array<{
    name: string
    link: LinkOptions
    icon: LucideIcon
    shortcut: HotkeySequence
  }>
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarGroup className="">
      <SidebarGroupLabel>Beaver Money</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false)
                }
              }}
              render={
                <Link
                  {...item.link}
                  className="group/nav-link"
                  activeProps={{ className: 'font-semibold' }}
                >
                  <item.icon />
                  <span>{item.name}</span>

                  <span className="grow"></span>
                  <KbdGroup className="hidden group-hover/nav-link:inline-flex">
                    {item.shortcut.map((key) => (
                      <Kbd key={`${item.name}-${key}`}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                </Link>
              }
            ></SidebarMenuButton>
            {/* <DropdownMenu> */}
            {/*   <DropdownMenuTrigger */}
            {/*     render={ */}
            {/*       <SidebarMenuAction showOnHover> */}
            {/*         <MoreHorizontal /> */}
            {/*         <span className="sr-only">More</span> */}
            {/*       </SidebarMenuAction> */}
            {/*     } */}
            {/*   ></DropdownMenuTrigger> */}
            {/*   <DropdownMenuContent */}
            {/*     className="w-48 rounded-lg" */}
            {/*     side={isMobile ? 'bottom' : 'right'} */}
            {/*     align={isMobile ? 'end' : 'start'} */}
            {/*   > */}
            {/*     <DropdownMenuItem> */}
            {/*       <Folder className="text-muted-foreground" /> */}
            {/*       <span>View Project</span> */}
            {/*     </DropdownMenuItem> */}
            {/*     <DropdownMenuItem> */}
            {/*       <Forward className="text-muted-foreground" /> */}
            {/*       <span>Share Project</span> */}
            {/*     </DropdownMenuItem> */}
            {/*     <DropdownMenuSeparator /> */}
            {/*     <DropdownMenuItem> */}
            {/*       <Trash2 className="text-muted-foreground" /> */}
            {/*       <span>Delete Project</span> */}
            {/*     </DropdownMenuItem> */}
            {/*   </DropdownMenuContent> */}
            {/* </DropdownMenu> */}
          </SidebarMenuItem>
        ))}
        {/* <SidebarMenuItem> */}
        {/*   <SidebarMenuButton className="text-sidebar-foreground/70"> */}
        {/*     <MoreHorizontal className="text-sidebar-foreground/70" /> */}
        {/*     <span>More</span> */}
        {/*   </SidebarMenuButton> */}
        {/* </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
