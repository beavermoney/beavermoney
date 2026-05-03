import { Menu } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { NAV } from '@/constant'

export function MobileFabNav() {
  const isMobile = useIsMobile()

  // Don't render on mobile if not available
  if (!isMobile) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="icon-lg" className="rounded-full" variant="secondary">
              <Menu className="" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {NAV.map((item) => {
            const Icon = item.icon

            return (
              <DropdownMenuItem
                key={item.name}
                render={
                  <Link
                    {...item.link}
                    activeProps={{ className: 'font-semibold' }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                }
              />
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
