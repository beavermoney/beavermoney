import { LayoutContent, VStack } from '@astryxdesign/core/Layout'
import type { ReactNode } from 'react'
export function HouseholdContentLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutContent padding={6}>
      <VStack gap={6} className="app-scroll-content">
        {children}
      </VStack>
    </LayoutContent>
  )
}
