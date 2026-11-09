import { useLingui } from '@lingui/react/macro'
import { useRouterState } from '@tanstack/react-router'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Stack } from '@astryxdesign/core/Stack'
import { Suspense, type ReactNode } from 'react'

export function RouteContentLoading() {
  const { t } = useLingui()
  return (
    <Stack
      direction="vertical"
      gap={4}
      padding={6}
      role="status"
      aria-label={t`Loading content`}
    >
      <Skeleton height={32} width="40%" />
      <Skeleton height={64} />
      <Skeleton height={64} />
      <Skeleton height={64} />
    </Stack>
  )
}

export function RouteContentBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteContentLoading />}>{children}</Suspense>
}

export function NavigationProgress() {
  const { t } = useLingui()
  const isLoading = useRouterState({ select: (state) => state.isLoading })
  if (!isLoading) return null
  return (
    <Stack className="pointer-events-none fixed inset-x-0 top-0 z-50 [&_.astryx-progress-bar-track]:h-0.5">
      <ProgressBar label={t`Loading page`} isLabelHidden isIndeterminate />
    </Stack>
  )
}
