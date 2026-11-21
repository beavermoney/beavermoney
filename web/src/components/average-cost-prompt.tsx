import { Suspense } from 'react'
import { useLingui } from '@lingui/react/macro'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import {
  useAverageReview,
  requestAverageReview,
} from '@/hooks/average-cost-review-store'
import { AverageCostEditor } from './average-cost-editor'
export function AverageCostPrompt() {
  const { t } = useLingui()
  const ids = useAverageReview()
  const close = () => requestAverageReview([])
  return (
    <Dialog
      isOpen={ids.length > 0}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      purpose="form"
    >
      <Stack direction="vertical" gap={4}>
        <DialogHeader
          title={t`Update average cost`}
          subtitle={t`Trade saved. Enter your updated average cost per share.`}
          onOpenChange={close}
        />
        <Text color="secondary">{t`You can also do this later from the holding or your next review.`}</Text>
        {ids.map((id) => (
          <Suspense key={id} fallback={<Text>{t`Loading holding…`}</Text>}>
            <AverageCostEditor
              investmentId={id}
              onSaved={() =>
                requestAverageReview(ids.filter((value) => value !== id))
              }
            />
          </Suspense>
        ))}
        <Button
          variant="ghost"
          className="self-start"
          label={t`Later`}
          onClick={close}
        />
      </Stack>
    </Dialog>
  )
}
