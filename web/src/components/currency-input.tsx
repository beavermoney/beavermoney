import { useCurrencyConfig } from '@/hooks/use-currency-config'
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useCallback, useState, type ComponentPropsWithoutRef } from 'react'

type CurrencyInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  locale: string
  currency: string
  value?: string | number
  decimalScale?: number
  allowNegative?: boolean
  onValueChange?: (values: { floatValue?: number; value: string }) => void
}

function valueToRaw(value: string | number | undefined): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (value === 0) return ''
  return String(value)
}

export function CurrencyInput({
  className: _className,
  locale,
  currency,
  decimalScale = 2,
  allowNegative = false,
  onValueChange,
  value,
  ...props
}: CurrencyInputProps) {
  const { prefix, suffix, decimalSeparator } = useCurrencyConfig(
    locale,
    currency,
  )

  const [rawValue, setRawValue] = useState(() => valueToRaw(value))

  const validate = useCallback(
    (raw: string): string => {
      let cleaned = ''
      let hasDecimal = false
      let digitsAfterDecimal = 0

      for (const ch of raw) {
        if (ch === '-' && allowNegative && cleaned === '') {
          cleaned += '-'
          continue
        }

        if (ch >= '0' && ch <= '9') {
          if (hasDecimal && digitsAfterDecimal >= decimalScale) continue
          if (hasDecimal) digitsAfterDecimal++
          cleaned += ch
          continue
        }

        if (ch === decimalSeparator && !hasDecimal) {
          hasDecimal = true
          cleaned += ch
          continue
        }
      }

      return cleaned
    },
    [decimalSeparator, decimalScale, allowNegative],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = validate(e.target.value)
      setRawValue(cleaned)

      const normalizedValue = cleaned.replace(decimalSeparator, '.')
      const floatValue =
        cleaned === '' ? undefined : parseFloat(normalizedValue)
      onValueChange?.({ floatValue, value: cleaned })
    },
    [decimalSeparator, validate, onValueChange],
  )

  const { name, disabled, readOnly, autoFocus, required } = props
  return (
    <InputGroup
      label={
        props['aria-label'] ??
        (name
          ? (name[0].toUpperCase() + name.slice(1)).replace(
              /([a-z])([A-Z])/g,
              '$1 $2',
            )
          : 'Amount')
      }

      isDisabled={disabled}
      status={props['aria-invalid'] === true ? { type: 'error' } : undefined}
    >
      {prefix && <InputGroupText>{prefix}</InputGroupText>}
      <TextInput
        id={props.id}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        aria-label={props['aria-label']}
        aria-invalid={props['aria-invalid']}
        aria-describedby={props['aria-describedby']}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        label={props['aria-label'] ?? name ?? 'Amount'}

        isLabelHidden
        htmlName={name}
        isDisabled={disabled}
        isReadOnly={readOnly}
        hasAutoFocus={autoFocus}
        isRequired={required}
        inputMode="decimal"
        value={rawValue}
        onChange={(_value, event) => handleChange(event)}
      />
      {suffix && <InputGroupText>{suffix}</InputGroupText>}
    </InputGroup>
  )
}
