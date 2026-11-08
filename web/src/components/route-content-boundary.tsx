import { useRouterState } from '@tanstack/react-router'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Suspense, type ReactNode } from 'react'

export function RouteContentLoading() {
  return (
    <Stack
      direction="vertical"
      gap={4}
      padding={6}
      role="status"
      aria-label="Loading content"
    >
      <Text type="supporting" color="secondary">
        Loading…
      </Text>
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
  const isLoading = useRouterState({ select: (state) => state.isLoading })
  if (!isLoading) return null
  return (
    <Stack
      direction="horizontal"
      gap={2}
      padding={4}
      align="center"
      role="status"
      aria-live="polite"
    >
      <Spinner size="sm" />
      <Text type="supporting" color="secondary">
        Loading page…
      </Text>
    </Stack>
  )
}
