import { lazy, Suspense, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useAverageReview } from '@/hooks/average-cost-review-store'
import { PageProgress } from './page-progress'
const AverageCostPromptSurface = lazy(
  () => import('./average-cost-prompt-surface'),
)

export function AverageCostPrompt() {
  const { t } = useLingui()
  const ids = useAverageReview()
  const [hasOpened, setHasOpened] = useState(false)
  if (ids.length > 0 && !hasOpened) setHasOpened(true)
  if (!hasOpened) return null
  return (
    <Suspense fallback={<PageProgress label={t`Loading content`} />}>
      <AverageCostPromptSurface />
    </Suspense>
  )
}
