import type { ReactNode } from 'react'
import { useLingui } from '@lingui/react/macro'
import { Stack } from '@astryxdesign/core/Stack'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Button } from '@astryxdesign/core/Button'
import styles from './average-cost-editor-layout.module.css'

export function AverageCostEditorLayout({
  summary,
  controls,
  feedback,
  loading = false,
}: {
  summary: ReactNode
  controls?: ReactNode
  feedback?: ReactNode
  loading?: boolean
}) {
  return (
    <Stack
      gap={3}
      className={styles.editor}
      aria-busy={loading}
      data-average-editor
    >
      <Stack gap={1} className={styles.summary} isScrollable>
        {summary}
      </Stack>
      <Stack gap={3} className={styles.controls}>
        {controls}
      </Stack>
      <Stack gap={2} className={styles.feedback} isScrollable>
        {feedback}
      </Stack>
    </Stack>
  )
}

export function AverageCostEditorSkeleton() {
  const { t } = useLingui()
  return (
    <AverageCostEditorLayout
      loading
      summary={
        <>
          <Skeleton height={20} width="75%" />
          <Skeleton height={20} width="50%" />
        </>
      }
      controls={
        <>
          <TextInput label={t`Average cost per share`} value="" isDisabled />
          <Button
            className="self-start"
            label={t`Confirm average cost`}
            variant="primary"
            isDisabled
          />
        </>
      }
    />
  )
}
