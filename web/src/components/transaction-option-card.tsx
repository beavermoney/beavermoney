import { useLingui } from '@lingui/react/macro'
import { SelectableCard } from '@astryxdesign/core/SelectableCard'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import { CheckCircle2, Circle } from 'lucide-react'
import { useId } from 'react'

export function TransactionOptionCard({
  option,
  value,
  onChange,
  onBlur,
  id,
}: {
  option: 'pending' | 'exclude'
  value: boolean
  onChange: (value: boolean) => void
  onBlur?: () => void
  id?: string
}) {
  const { t } = useLingui()
  const descriptionId = useId()
  const label = option === 'pending' ? t`Pending` : t`Exclude from reports`
  const description =
    option === 'pending'
      ? t`Mark this transaction to review later. Balances and reports stay unchanged.`
      : t`Leave this transaction out of reports. Account balances still include it.`

  return (
    <SelectableCard
      id={id}
      label={label}
      isSelected={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-describedby={descriptionId}
      width="100%"
    >
      <Stack direction="horizontal" gap={3} vAlign="start">
        <Icon icon={value ? CheckCircle2 : Circle} aria-hidden="true" />
        <Stack gap={1}>
          <Text type="label">{label}</Text>
          <Text id={descriptionId} type="supporting">
            {description}
          </Text>
        </Stack>
      </Stack>
    </SelectableCard>
  )
}
