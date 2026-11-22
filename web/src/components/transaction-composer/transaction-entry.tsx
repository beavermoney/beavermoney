import { lazy, Suspense, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { PageProgress } from '@/components/page-progress'

const TransactionEntrySurface = lazy(
  () => import('./transaction-entry-surface'),
)

export function TransactionEntry() {
  const { t } = useLingui()
  const { type } = useLogTransaction()
  const [hasOpened, setHasOpened] = useState(false)
  // Retain the loaded surface after first use so closing transitions still run.
  if (type !== null && !hasOpened) setHasOpened(true)
  if (!hasOpened) return null
  return (
    <Suspense fallback={<PageProgress label={t`Loading content`} />}>
      <TransactionEntrySurface />
    </Suspense>
  )
}
