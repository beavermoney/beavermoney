import { UserIcon, UsersIcon } from 'lucide-react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

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
    <Combobox
      items={options.map((o) => o.id)}
      itemToStringLabel={(item) =>
        options.find((o) => o.id === item)?.name ?? ''
      }
      value={value}
      onValueChange={(next) => onValueChange(next || '')}
    >
      <ComboboxInput
        id={id}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
      />
      <ComboboxContent>
        <ComboboxEmpty>No owners.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => {
            const owner = options.find((o) => o.id === item)
            if (!owner) return null
            return (
              <ComboboxItem
                key={item}
                value={item}
                className="flex items-center gap-2"
              >
                {owner.isSynthetic ? (
                  <UsersIcon className="size-4 shrink-0" />
                ) : (
                  <UserIcon className="size-4 shrink-0" />
                )}
                <span>{owner.name}</span>
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
