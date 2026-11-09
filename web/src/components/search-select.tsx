import { useLingui } from '@lingui/react/macro'
import { useComposer } from './transaction-composer/context'
import { ComposerChoice } from './transaction-composer/controls'
import { Selector } from '@astryxdesign/core/Selector'
import { useState, type ReactNode } from 'react'
import { Stack } from '@astryxdesign/core/Stack'
import { Card } from '@astryxdesign/core/Card'
import { Item } from '@astryxdesign/core/Item'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'

type SearchSelectProps<T> = {
  inline?: boolean
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
  confirmSelection?: boolean
  hideChipLabel?: boolean
  renderChipIcon?: (item: T) => ReactNode
}

// Keep domain objects intact while Astryx owns the searchable selector surface.
export function SearchSelect<T>({
  inline = false,
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
  confirmSelection = false,
  hideChipLabel,
  renderChipIcon,
  disabledMessage,
  ...props
}: SearchSelectProps<T>) {
  const { t } = useLingui()

  const composer = useComposer()
  const [query, setQuery] = useState('')
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
  if (inline) {
    const matches = options.filter(({ item, label }) =>
      `${label} ${getSearchText?.(item) ?? ''}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
    )
    return (
      <Stack gap={3}>
        <TextInput
          label={t`Search ${label.toLowerCase()}`}
          isLabelHidden
          placeholder={t`Search ${label.toLowerCase()}`}
          value={query}
          onChange={setQuery}
        />
        {matches.map((option) => (
          <Card key={option.id} padding={0}>
            <Item
              density="spacious"
              label={renderOption?.(option.item) ?? option.label}
              isSelected={value != null && key(value) === option.id}
              onClick={() => {
                onChange?.(option.item)
                props.onBlur?.()
              }}
            />
          </Card>
        ))}
        {!matches.length && (
          <Text type="supporting">{emptyText ?? t`No matching options.`}</Text>
        )}
      </Stack>
    )
  }
  if (composer)
    return (
      <ComposerChoice
        name={name ?? props.id ?? label}
        label={label}
        value={value}
        items={items}
        getLabel={text}
        getKey={key}
        getSearchText={getSearchText}
        renderOption={renderOption}
        onChange={(next) => {
          onChange?.(next)
          props.onBlur?.()
        }}
        disabled={props.isDisabled}
        invalid={invalid}
        searchable={searchable}
        closeOnSelect={!confirmSelection}
        hideChipLabel={hideChipLabel}
        renderChipIcon={renderChipIcon}
      />
    )
  return (
    <Selector
      {...props}
      label={label}
      htmlName={name}
      hasClear
      hasSearch={searchable}
      presentation="adaptive"
      disabledMessage={disabledMessage}
      searchPlaceholder={t`Search ${label.toLowerCase()}`}
      emptyText={emptyText}
      emptySearchText={emptyText}
      status={invalid ? { type: 'error' } : undefined}
      options={options.map((option) => ({
        value: option.id,
        // Selector searches its option labels; render the concise display text below.
        label: `${option.label} ${getSearchText?.(option.item) ?? ''}`.trim(),
      }))}
      renderValue={(option) => {
        const entry = optionText(option.value)
        return entry && renderChipIcon ? (
          <Stack direction="horizontal" gap={2} vAlign="center">
            {renderChipIcon(entry.item)}
            <Text>{entry.label}</Text>
          </Stack>
        ) : (
          (entry?.label ?? option.label)
        )
      }}
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
