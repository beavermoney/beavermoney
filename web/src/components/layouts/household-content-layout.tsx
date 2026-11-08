import { LayoutContent, VStack } from '@astryxdesign/core/Layout'
import type { ReactNode } from 'react'
export function HouseholdContentLayout({
  children,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <LayoutContent padding={6}>
      <VStack gap={6}>{children}</VStack>
    </LayoutContent>
  )
}
