import type { PendingCalculation } from './amount-entry'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Item } from '@astryxdesign/core/Item'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { createPortal } from 'react-dom'
import { useState, type ReactNode } from 'react'
import { useComposer } from './context'
import { ComposerKeypad } from './keypad'

export function ComposerEditor({
  name,
  children,
}: {
  name: string
  children: ReactNode
}) {
  const composer = useComposer()
  return composer?.target && composer.editor === name
    ? createPortal(children, composer.target)
    : null
}

export function ComposerChoice<T>({
  name,
  label,
  value,
  items,
  getLabel,
  getSearchText,
  getKey,
  renderOption,
  onChange,
  disabled,
  invalid,
  searchable = true,
  closeOnSelect = true,
  hideChipLabel = false,
  renderChipIcon,
}: {
  name: string
  label: string
  value?: T | null
  items: readonly T[]
  getLabel: (item: T) => string
  getKey: (item: T) => string
  getSearchText?: (item: T) => string
  renderOption?: (item: T) => ReactNode
  onChange: (item: T) => void
  disabled?: boolean
  invalid?: boolean
  searchable?: boolean
  closeOnSelect?: boolean
  hideChipLabel?: boolean
  renderChipIcon?: (item: T) => ReactNode
}) {
  const composer = useComposer()
  const [query, setQuery] = useState('')
  if (!composer) return null
  const matches = items.filter((item) =>
    `${getLabel(item)} ${getSearchText?.(item) ?? ''}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  )
  return (
    <>
      <Button
        type="button"
        label={`${label}: ${value == null ? 'Choose' : getLabel(value)}`}
        icon={value == null ? undefined : renderChipIcon?.(value)}
        isDisabled={disabled}
        aria-invalid={invalid}
        aria-expanded={composer.editor === name}
        onClick={() => {
          setQuery('')
          composer.setEditor(name)
        }}
        variant={invalid ? 'primary' : 'secondary'}
      >
        {composer.compactAmounts && renderChipIcon && value != null ? (
          <Text maxLines={2}>{getLabel(value)}</Text>
        ) : hideChipLabel && value != null ? (
          getLabel(value)
        ) : (
          `${label}: ${value == null ? 'Choose' : getLabel(value)}`
        )}
      </Button>
      <ComposerEditor name={name}>
        <Stack gap={3} className="composer-choice">
          <Text type="label">{label}</Text>
          {searchable && (
            <TextInput
              label={`Search ${label.toLowerCase()}`}
              placeholder={`Search ${label.toLowerCase()}`}
              isLabelHidden
              value={query}
              onChange={setQuery}
            />
          )}
          <Stack className="composer-choice-results">
            <Stack gap={2}>
              {matches.map((item) => (
                <Card key={getKey(item)} padding={0}>
                  <Item
                    density="spacious"
                    label={renderOption?.(item) ?? getLabel(item)}
                    isSelected={value != null && getKey(item) === getKey(value)}
                    onClick={() => {
                      onChange(item)
                      if (closeOnSelect) composer.setEditor(null)
                    }}
                  />
                </Card>
              ))}
              {matches.length === 0 && (
                <Text type="supporting">No matching options.</Text>
              )}
            </Stack>
          </Stack>
        </Stack>
      </ComposerEditor>
    </>
  )
}

export function ComposerAmount({
  name,
  label,
  raw,
  prefix,
  currencyCode,
  suffix,
  decimal,
  scale,
  onChange,
  invalid,
  disabled,
}: {
  name: string
  label: string
  raw: string
  prefix: string
  currencyCode?: string
  suffix: string
  decimal: string
  scale: number
  onChange: (next: string) => void
  invalid?: boolean
  disabled?: boolean
}) {
  const [pending, setPending] = useState<PendingCalculation | null>(null)
  const composer = useComposer()
  if (!composer) return null
  const active = composer.activeAmount === name
  if (pending && (raw === '' || !active)) setPending(null)
  return (
    <>
      <Button
        type="button"
        label={`Edit ${label}: ${prefix}${raw || '0'}${suffix}`}
        width="100%"
        className="composer-amount"
        isDisabled={disabled}
        aria-pressed={active}
        aria-invalid={invalid}
        variant={active ? 'primary' : 'secondary'}
        onClick={() => {
          composer.setActiveAmount(name)
          composer.setEditor(null)
        }}
      >
        <Stack gap={1}>
          <Text type="supporting" color="inherit">
            {pending
              ? `${pending.left} ${pending.operator === '-' ? '−' : '+'} ${pending.right || '…'}`
              : `${label}${currencyCode ? ` · ${currencyCode}` : ''}`}
          </Text>
          <Text
            type="large"
            size={composer.compactAmounts ? 'xl' : active ? '3xl' : 'lg'}
            color="inherit"
            hasTabularNumbers
          >
            {prefix}
            {raw || '0'}
            {suffix}
          </Text>
        </Stack>
      </Button>
      {active &&
        composer.keypadTarget &&
        createPortal(
          <ComposerKeypad
            value={raw}
            decimal={decimal}
            scale={scale}
            onChange={onChange}
            date={composer.dateField}
            pending={pending}
            setPending={setPending}
          />,
          composer.keypadTarget,
        )}
    </>
  )
}
