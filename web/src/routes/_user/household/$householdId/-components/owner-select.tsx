import { HStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { SearchSelect } from '@/components/search-select'
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
  placeholder?: string
}

export function OwnerSelect({
  value,
  onValueChange,
  options,
  id,
  name,
  onBlur,
  ariaInvalid,
  placeholder = 'Select an owner',
}: OwnerSelectProps) {
  return (
    <SearchSelect
      name={name}
      invalid={ariaInvalid}
      items={options.map((o) => o.id)}
      getLabel={(item) => options.find((o) => o.id === item)?.name ?? ''}
      value={value}
      onChange={(next) => onValueChange(next || '')}
      id={id}
      placeholder={placeholder}
      onBlur={onBlur}
      label="Owner"
      renderOption={(item: string) => {
        const owner = options.find((o) => o.id === item)
        if (!owner) return null
        return (
          <HStack gap={2} vAlign="center">
            {owner.isSynthetic ? (
              <AstryxIcon icon={UsersIcon} />
            ) : (
              <AstryxIcon icon={UserIcon} />
            )}
            <Text>{owner.name}</Text>
          </HStack>
        )
      }}
      emptyText={<>No owners.</>}
    />
  )
}
