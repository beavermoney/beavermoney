import { Selector } from '@astryxdesign/core/Selector'
import type { ReactNode } from 'react'

type SearchSelectProps<T> = {
  items: readonly T[]
  value?: T | null
  onChange?: (value: T | null) => void
  getLabel?: (item: T) => string
  getSearchText?: (item: T) => string
  renderOption?: (item: T) => ReactNode
  label: string
  id?: string
  name?: string
  placeholder?: string
  onBlur?: () => void
  emptyText?: ReactNode
  isDisabled?: boolean
  disabledMessage?: string
  invalid?: boolean
  isLabelHidden?: boolean
  searchable?: boolean
}

// Keep domain objects intact while Astryx owns the searchable selector surface.
export function SearchSelect<T>({
  items,
  value,
  onChange,
  getLabel,
  getSearchText,
  renderOption,
  label,
  name,
  invalid,
  emptyText,
  searchable = true,
  disabledMessage,
  ...props
}: SearchSelectProps<T>) {
  const text = (item: T) =>
    getLabel
      ? getLabel(item)
      : typeof item === 'object' && item !== null && 'label' in item
        ? String(item.label)
        : String(item)
  const key = (item: T) =>
    typeof item === 'object' && item !== null
      ? 'id' in item
        ? String(item.id)
        : 'value' in item
          ? String(item.value)
          : String(items.indexOf(item))
      : String(item)
  const options = items.map((item) => ({
    id: key(item),
    label: text(item),
    item,
  }))
  const optionText = (id: string) => options.find((option) => option.id === id)
  return (
    <Selector
      {...props}
      label={label}
      htmlName={name}
      hasClear
      hasSearch={searchable}
      presentation="adaptive"
      disabledMessage={disabledMessage}
      searchPlaceholder={`Search ${label.toLowerCase()}`}
      emptyText={emptyText}
      emptySearchText={emptyText}
      status={invalid ? { type: 'error' } : undefined}
      options={options.map((option) => ({
        value: option.id,
        // Selector searches its option labels; render the concise display text below.
        label: `${option.label} ${getSearchText?.(option.item) ?? ''}`.trim(),
      }))}
      renderValue={(option) => optionText(option.value)?.label ?? option.label}
      renderOption={(option) => {
        const entry = optionText(option.value)
        return entry
          ? (renderOption?.(entry.item) ?? entry.label)
          : option.label
      }}
      value={value == null ? null : key(value)}
      onChange={(next) => onChange?.(optionText(next ?? '')?.item ?? null)}
      width="100%"
    />
  )
}
