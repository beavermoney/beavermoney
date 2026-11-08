import { Selector } from '@astryxdesign/core/Selector'
import { Typeahead } from '@astryxdesign/core/Typeahead'
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

// Keep domain objects intact while Astryx owns search, keyboard navigation and selection.
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
  if (!searchable)
    return (
      <Selector
        {...props}
        label={label}
        htmlName={name}
        hasClear
        status={invalid ? { type: 'error' } : undefined}
        options={options.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
        value={value == null ? null : key(value)}
        onChange={(next) =>
          onChange?.(options.find((option) => option.id === next)?.item ?? null)
        }
        width="100%"
      />
    )
  return (
    <Typeahead
      {...props}
      label={label}
      status={invalid ? { type: 'error' } : undefined}
      disabledMessage={disabledMessage}
      value={
        value == null
          ? null
          : (options.find((option) => option.id === key(value)) ?? null)
      }
      onChange={(next) => onChange?.(next?.item ?? null)}
      placeholder={props.placeholder ?? `Search ${label.toLowerCase()}`}
      hasEntriesOnFocus
      minQueryLength={0}
      debounceMs={0}
      maxMenuItems={8}
      emptySearchText={emptyText}
      searchSource={{
        bootstrap: () => options,
        search: (query) =>
          options.filter((option) =>
            `${option.label} ${getSearchText?.(option.item) ?? ''}`
              .toLocaleLowerCase()
              .includes(query.trim().toLocaleLowerCase()),
          ),
      }}
      renderItem={
        renderOption ? (option) => renderOption(option.item) : undefined
      }
      width="100%"
    />
  )
}
