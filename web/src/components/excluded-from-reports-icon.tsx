import { useLingui } from '@lingui/react/macro'
import { Icon } from '@astryxdesign/core/Icon'
import { Tooltip } from '@astryxdesign/core/Tooltip'

export function ExcludedFromReportsIcon() {
  const { t } = useLingui()
  return (
    <Tooltip content={t`Excluded from reports`} hasHoverIndication={false}>
      <Icon
        icon="eyeSlash"
        size="sm"
        color="secondary"
        label={t`Excluded from reports`}
      />
    </Tooltip>
  )
}
