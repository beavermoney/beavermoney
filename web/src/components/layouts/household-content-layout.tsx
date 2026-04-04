import type { ReactNode } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface HouseholdContentLayoutProps {
  children: ReactNode
  className?: string
}

function HouseholdContentLayout({
  children,
  className,
}: HouseholdContentLayoutProps) {
  return (
    <ScrollArea className="h-[calc(100vh-48px)] overflow-y-auto">
      <div className={cn('mx-auto max-w-5xl p-4', className)}>{children}</div>
    </ScrollArea>
  )
}

export { HouseholdContentLayout }
