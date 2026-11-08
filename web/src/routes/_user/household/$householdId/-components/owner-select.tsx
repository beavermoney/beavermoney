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
      label={'Value'}
      renderOption={(item: string) => {
        const owner = options.find((o) => o.id === item)
        if (!owner) return null
        return (
          <span>
            {owner.isSynthetic ? (
              <AstryxIcon icon={UsersIcon} />
            ) : (
              <AstryxIcon icon={UserIcon} />
            )}
            <span>{owner.name}</span>
          </span>
        )
      }}
      emptyText={<>No owners.</>}
    />
  )
}
