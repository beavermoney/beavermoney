import { useLingui } from '@lingui/react/macro'
import { Icon } from '@astryxdesign/core/Icon'
import { Tooltip } from '@astryxdesign/core/Tooltip'

export function PendingTransactionIcon() {
  const { t } = useLingui()
  return (
    <Tooltip content={t`Pending — review later`} hasHoverIndication={false}>
      <Icon icon="clock" size="sm" color="secondary" label={t`Pending`} />
    </Tooltip>
  )
}
