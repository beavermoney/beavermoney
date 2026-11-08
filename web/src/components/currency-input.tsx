import { useComposer } from './transaction-composer/context'
import { ComposerAmount } from './transaction-composer/controls'
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
  showCurrencySymbol?: boolean
  allowNegative?: boolean
  onValueChange?: (values: { floatValue?: number; value: string }) => void
}

function valueToRaw(
  value: string | number | undefined,
  decimalSeparator: string,
): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  const text = String(value)
  const expanded = /e/i.test(text)
    ? value.toLocaleString('en-US', {
        useGrouping: false,
        maximumFractionDigits: 20,
      })
    : text
  return expanded.replace('.', decimalSeparator)
}

function rawToFloat(raw: string, decimalSeparator: string) {
  const parsed = parseFloat(raw.replace(decimalSeparator, '.'))
  return Number.isNaN(parsed) ? undefined : parsed
}

export function CurrencyInput({
  className: _className,
  locale,
  currency,
  decimalScale = 2,
  allowNegative = false,
  showCurrencySymbol = true,
  onValueChange,
  value,
  ...props
}: CurrencyInputProps) {
  const composer = useComposer()
  const { prefix, suffix, decimalSeparator } = useCurrencyConfig(
    locale,
    currency,
  )

  const [rawValue, setRawValue] = useState(() =>
    valueToRaw(value, decimalSeparator),
  )
  const [lastValue, setLastValue] = useState(value)
  if (!Object.is(value, lastValue)) {
    const nextRawValue = valueToRaw(value, decimalSeparator)
    setLastValue(value)
    if (
      rawToFloat(rawValue, decimalSeparator) !==
      rawToFloat(nextRawValue, decimalSeparator)
    ) {
      setRawValue(nextRawValue)
    }
  }

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
  if (composer) {
    return (
      <ComposerAmount
        name={name ?? props.id ?? 'amount'}
        label={
          props['aria-label'] ??
          (name
            ? (name[0].toUpperCase() + name.slice(1)).replace(
                /([a-z])([A-Z])/g,
                '$1 $2',
              )
            : 'Amount')
        }
        currencyCode={showCurrencySymbol ? currency : undefined}
        raw={rawValue}
        prefix={showCurrencySymbol ? prefix : ''}
        suffix={showCurrencySymbol ? suffix : ''}
        decimal={decimalSeparator}
        scale={decimalScale}
        disabled={disabled || readOnly}
        invalid={props['aria-invalid'] === true}
        onChange={(next) => {
          const cleaned = next.startsWith('-')
            ? '-' + validate(next.slice(1))
            : validate(next)
          setRawValue(cleaned)
          onValueChange?.({
            floatValue: rawToFloat(cleaned, decimalSeparator),
            value: cleaned,
          })
        }}
      />
    )
  }
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
      {showCurrencySymbol && prefix && (
        <InputGroupText>{prefix}</InputGroupText>
      )}
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
      {showCurrencySymbol && suffix && (
        <InputGroupText>{suffix}</InputGroupText>
      )}
    </InputGroup>
  )
}
