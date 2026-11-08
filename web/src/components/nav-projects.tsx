import { useAppShellMobile } from '@astryxdesign/core/AppShell'
import { Kbd } from '@astryxdesign/core/Kbd'
import { SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import type { HotkeySequence } from '@tanstack/react-hotkeys'
import {
  useRouter,
  useRouterState,
  type LinkOptions,
} from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

export function NavProjects({
  projects,
  title = 'Household',
}: {
  title?: string
  projects: {
    name: string
    link: LinkOptions
    icon: LucideIcon
    shortcut?: HotkeySequence
  }[]
}) {
  const { closeMobileNav } = useAppShellMobile()
  const router = useRouter()
  const location = useRouterState({
    select: (state) => state.location,
  })
  return (
    <SideNavSection title={title}>
      {projects.map((item) => {
        const href = router.buildLocation(item.link).href
        return (
          <SideNavItem
            key={item.name}
            label={item.name}
            icon={item.icon}
            className="group/nav-item"
            href={href}
            isSelected={location.pathname.startsWith(href.split('?')[0])}
            endContent={
              item.shortcut ? (
                <Kbd
                  keys={item.shortcut.map(String).join('+')}
                  className="opacity-0 group-focus-within/nav-item:opacity-100 group-hover/nav-item:opacity-100"
                />
              ) : undefined
            }
            onClick={(event) => {
              if (
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                event.preventDefault()
                closeMobileNav()
                void router.navigate(item.link)
              }
            }}
          />
        )
      })}
    </SideNavSection>
  )
}
