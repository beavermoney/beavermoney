import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface HouseholdMobileOnlyProps {
  children: ReactNode
  className?: string
}

function HouseholdMobileOnly({
  children,
  className,
}: HouseholdMobileOnlyProps) {
  return <div className={cn('lg:hidden', className)}>{children}</div>
}

export { HouseholdMobileOnly }
