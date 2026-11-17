import { LayoutContent, VStack } from '@astryxdesign/core/Layout'
import type { ReactNode } from 'react'
export function HouseholdContentLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <LayoutContent padding={6} className={className}>
      <VStack gap={6} className="app-scroll-content">
        {children}
      </VStack>
    </LayoutContent>
  )
}
