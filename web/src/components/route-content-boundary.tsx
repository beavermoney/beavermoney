import { useLingui } from '@lingui/react/macro'
import { useRouterState } from '@tanstack/react-router'
import { PageProgress } from '@/components/page-progress'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Text } from '@astryxdesign/core/Text'
import styles from './route-content-boundary.module.css'
import { Stack } from '@astryxdesign/core/Stack'
import { Suspense, type ReactNode } from 'react'

export function RouteContentLoading() {
  const { t } = useLingui()
  return (
    <Stack
      direction="vertical"
      gap={4}
      className={styles.loading}
      align="center"
      justify="center"
      role="status"
      aria-label={t`Loading content`}
    >
      <Spinner />
      <Text color="secondary">{t`Loading content`}</Text>
    </Stack>
  )
}

export function RouteContentBoundary({ children }: { children: ReactNode }) {
  return (
    <Stack className={styles.viewport}>
      <Suspense fallback={<RouteContentLoading />}>{children}</Suspense>
    </Stack>
  )
}

export function NavigationProgress() {
  const { t } = useLingui()
  const isLoading = useRouterState({ select: (state) => state.isLoading })
  if (!isLoading) return null
  return <PageProgress label={t`Loading page`} />
}
