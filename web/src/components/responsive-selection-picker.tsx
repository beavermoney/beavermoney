import { SearchSelect } from './search-select'
import type { ReactNode } from 'react'

type ResponsiveSelectionPickerProps<T> = {
  items: ReadonlyArray<T>
  name: string
  value: string
  label: string
  placeholder: string
  emptyMessage: string
  getValue: (item: T) => string
  getLabel: (item: T) => string
  renderItem: (item: T) => ReactNode
  onValueChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
}

export function ResponsiveSelectionPicker<T>({
  items,
  name,
  value,
  label,
  placeholder,
  emptyMessage,
  getValue,
  getLabel,
  renderItem,
  onValueChange,
  onBlur,
  invalid,
}: ResponsiveSelectionPickerProps<T>) {
  return (
    <SearchSelect
      items={items.map((item) => ({
        value: getValue(item),
        label: getLabel(item),
        item,
      }))}
      value={
        items
          .filter((item) => getValue(item) === value)
          .map((item) => ({
            value: getValue(item),
            label: getLabel(item),
            item,
          }))[0] ?? null
      }
      label={label}
      id={name}
      name={name}
      placeholder={placeholder}
      emptyText={emptyMessage}
      invalid={invalid}
      onBlur={onBlur}
      onChange={(option) => onValueChange(option?.value ?? '')}
      renderOption={(option) => renderItem(option.item)}
    />
  )
}
