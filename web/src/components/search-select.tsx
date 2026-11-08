import { Selector } from '@astryxdesign/core/Selector'
import type { ReactNode } from 'react'

type SearchSelectProps<T> = {
  items: readonly T[]
  value?: T | null
  onChange?: (value: T | null) => void
  getLabel?: (item: T) => string
  renderOption?: (item: T) => ReactNode
  label: string
  id?: string
  name?: string
  placeholder?: string
  onBlur?: () => void
  emptyText?: ReactNode
  isDisabled?: boolean
  invalid?: boolean
}

// Adapts domain objects to Astryx's string-valued, searchable Selector.
export function SearchSelect<T>({
  items,
  value,
  onChange,
  getLabel,
  renderOption,
  label,
  name,
  invalid,
  ...props
}: SearchSelectProps<T>) {
  const text = (item: T) =>
    getLabel
      ? getLabel(item)
      : typeof item === 'object' && item !== null && 'label' in item
        ? String(item.label)
        : String(item)
  const key = (item: T) =>
    typeof item === 'object' && item !== null && 'value' in item
      ? String(item.value)
      : String(item)
  const options = items.map((item) => ({ value: key(item), label: text(item) }))
  return (
    <Selector
      {...props}
      status={invalid ? { type: 'error' } : undefined}
      label={label}

      htmlName={name}
      hasSearch
      hasClear
      options={options}
      value={value == null ? null : key(value)}
      onChange={(next) =>
        onChange?.(items.find((item) => key(item) === next) ?? null)
      }
      renderOption={
        renderOption
          ? (option) => {
              const item = items.find((item) => key(item) === option.value)
              return item === undefined ? option.label : renderOption(item)
            }
          : undefined
      }
      width="100%"
    />
  )
}
