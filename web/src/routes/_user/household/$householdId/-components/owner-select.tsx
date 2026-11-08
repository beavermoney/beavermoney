import { useComposer } from '@/components/transaction-composer/context'
import { ComposerChoice } from '@/components/transaction-composer/controls'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { UserIcon, UsersIcon } from 'lucide-react'

export type OwnerOption = {
  id: string
  name: string
  isSynthetic: boolean
}

type OwnerSelectProps = {
  value: string
  onValueChange: (next: string) => void
  options: ReadonlyArray<OwnerOption>
  id?: string
  name?: string
  onBlur?: () => void
  ariaInvalid?: boolean
}

export function OwnerSelect({
  value,
  onValueChange,
  options,
  id,
  name,
  onBlur,
  ariaInvalid,
}: OwnerSelectProps) {
  const composer = useComposer()
  if (composer)
    return (
      <ComposerChoice
        name={name ?? 'owner'}
        label="Owner"
        hideChipLabel
        value={options.find((option) => option.id === value)}
        items={options}
        getLabel={(option) => option.name}
        getKey={(option) => option.id}
        onChange={(option) => {
          onValueChange(option.id)
          onBlur?.()
        }}
        invalid={ariaInvalid}
        searchable={false}
      />
    )
  return (
    <Stack direction="vertical" gap={1}>
      <Text type="label">Owner</Text>
      {name && <input type="hidden" name={name} value={value} />}
      <SegmentedControl
        id={id}
        label="Owner"
        value={value}
        onChange={onValueChange}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
      >
        {options.map((owner) => (
          <SegmentedControlItem
            key={owner.id}
            value={owner.id}
            label={owner.name}
            icon={
              <AstryxIcon icon={owner.isSynthetic ? UsersIcon : UserIcon} />
            }
          />
        ))}
      </SegmentedControl>
    </Stack>
  )
}
