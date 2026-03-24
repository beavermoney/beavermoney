import type { ReactNode } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface HouseholdSplitPaneLayoutProps {
  left: ReactNode
  right: ReactNode
  rightKey?: string
  className?: string
  leftClassName?: string
  rightClassName?: string
}

function HouseholdSplitPaneLayout({
  left,
  right,
  rightKey,
  className,
  leftClassName,
  rightClassName,
}: HouseholdSplitPaneLayoutProps) {
  return (
    <div className={cn('flex h-[calc(100vh-48px)]', className)}>
      <ScrollArea
        className={cn(
          'hidden flex-1 overflow-y-auto p-4 lg:block',
          leftClassName,
        )}
      >
        {left}
      </ScrollArea>
      <Separator orientation="vertical" className="hidden w-px lg:block" />
      <ScrollArea
        className={cn('flex-1 overflow-y-auto p-4', rightClassName)}
        key={rightKey}
      >
        {right}
      </ScrollArea>
    </div>
  )
}

export { HouseholdSplitPaneLayout }
