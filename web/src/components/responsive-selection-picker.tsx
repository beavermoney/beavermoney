import { Button } from '@astryxdesign/core/Button'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { useIsMobile } from '@/hooks/use-mobile'

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
  const isMobile = useIsMobile()
  const [editing, setEditing] = useState(false)
  const selected = items.find((item) => getValue(item) === value)
  const expanded = !selected || editing
  const summaryRef = useRef<HTMLButtonElement>(null)
  const wasExpanded = useRef(expanded)

  useEffect(() => {
    if (isMobile && wasExpanded.current && !expanded) {
      summaryRef.current?.focus({ preventScroll: true })
    }
    wasExpanded.current = expanded
  }, [expanded, isMobile])

  if (isMobile) {
    if (!expanded && selected) {
      return (
        <Button
          label={`${label}: ${getLabel(selected)}`}
          variant="secondary"
          width="100%"
          ref={summaryRef}
          type="button"
          id={name}
          aria-expanded={false}
          aria-label={`${label}: ${getLabel(selected)}`}
          onClick={() => setEditing(true)}
          icon={<AstryxIcon icon={ChevronDownIcon} />}
        ></Button>
      )
    }

    return (
      <RadioList
        id={name}
        label={label}
        isLabelHidden
        htmlName={name}
        value={value}
        onChange={(next) => {
          onValueChange(next)
          setEditing(false)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) onBlur()
        }}
        status={invalid ? { type: 'error' } : undefined}
      >
        {items.length === 0 ? (
          <Text as="p" display="block" color="secondary">
            {emptyMessage}
          </Text>
        ) : (
          items.map((item) => (
            <RadioListItem
              key={getValue(item)}
              value={getValue(item)}
              label={renderItem(item)}
              aria-label={getLabel(item)}
              onClick={() => {
                if (value === getValue(item)) setEditing(false)
              }}
            />
          ))
        )}
      </RadioList>
    )
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) onBlur()
      }}
      alignment={'start'}
      renderTrigger={(triggerProps) => (
        <Button
          {...triggerProps}
          id={name}
          name={name}
          type="button"
          aria-invalid={invalid}

          label={`${label}: ${selected ? getLabel(selected) : placeholder}`}
          variant={'secondary'}

          endContent={
            <AstryxIcon icon={ChevronDownIcon} data-icon="inline-end" />
          }
        >
          {selected ? (
            <span>{renderItem(selected)}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      )}
    >
      <ScrollableArea label="Scrollable content">
        <Stack direction="vertical" gap={4}>
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup
              value={value}
              onChange={(nextValue) => {
                if (typeof nextValue === 'string') onValueChange(nextValue)
              }}
              label="Options"
              hasCloseOnSelect
            >
              {items.map((item) => {
                const itemValue = getValue(item)
                return (
                  <DropdownMenuRadioItem
                    key={itemValue}
                    value={itemValue}
                    aria-label={getLabel(item)}

                    label={<>{renderItem(item)}</>}
                  />
                )
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </Stack>
      </ScrollableArea>
    </DropdownMenu>
  )
}
