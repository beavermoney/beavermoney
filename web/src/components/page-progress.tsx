import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { Stack } from '@astryxdesign/core/Stack'

export function PageProgress({ label }: { label: string }) {
  return (
    <Stack className="pointer-events-none fixed inset-x-0 top-0 z-50 [&_.astryx-progress-bar-track]:h-0.5">
      <ProgressBar label={label} isLabelHidden isIndeterminate />
    </Stack>
  )
}
