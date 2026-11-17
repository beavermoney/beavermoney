import { useLingui } from '@lingui/react/macro'
import { Card } from '@astryxdesign/core/Card'
import { Item } from '@astryxdesign/core/Item'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Text } from '@astryxdesign/core/Text'
import { useId, useRef } from 'react'

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
  const checkboxRef = useRef<HTMLInputElement>(null)
  const label = option === 'pending' ? t`Pending` : t`Exclude from reports`
  const description =
    option === 'pending'
      ? t`Flag for later review. Included in balances and reports.`
      : t`Hide from reports. Still included in account balances.`

  return (
    <Card padding={0}>
      <Item
        label={label}
        description={
          <Text id={descriptionId} type="supporting">
            {description}
          </Text>
        }
        density="spacious"
        align="first-line"
        interactiveRef={checkboxRef}
        endContent={
          <CheckboxInput
            ref={checkboxRef}
            id={id}
            label={label}
            isLabelHidden
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            aria-describedby={descriptionId}
          />
        }
      />
    </Card>
  )
}
