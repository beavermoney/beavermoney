import safeAreaStyles from '@/components/layouts/safe-area.module.css'
import styles from './household-content-layout.module.css'
import { cn } from '@/lib/utils'
import { LayoutContent, VStack } from '@astryxdesign/core/Layout'
import type { ReactNode } from 'react'
import { usePageScrollRestoration } from '@/hooks/use-page-scroll-restoration'
export function HouseholdContentLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const scrollRef = usePageScrollRestoration()
  return (
    <LayoutContent
      ref={scrollRef}
      data-scroll-restoration-id="page-content"
      className={cn(styles.content, className)}
    >
      <VStack gap={6} className={safeAreaStyles.scrollContent}>
        {children}
      </VStack>
    </LayoutContent>
  )
}
