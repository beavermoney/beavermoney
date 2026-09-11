import { cn } from '@/lib/utils'
import { controlGroupSurfaceClassName } from '@/components/ui/control-surface'
import { useCallback, useState, type ComponentPropsWithoutRef } from 'react'
import { useCurrencyConfig } from '@/hooks/use-currency-config'

type CurrencyInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  locale: string
  currency: string
  value?: string | number
  decimalScale?: number
  allowNegative?: boolean
  showCurrencySymbol?: boolean
  onValueChange?: (values: { floatValue?: number; value: string }) => void
}

function valueToRaw(
  value: string | number | undefined,
  decimalSeparator: string,
): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return String(value).replace('.', decimalSeparator)
}

function rawToFloat(raw: string, decimalSeparator: string) {
  const parsed = parseFloat(raw.replace(decimalSeparator, '.'))
  return Number.isNaN(parsed) ? undefined : parsed
}

export function CurrencyInput({
  className,
  locale,
  currency,
  decimalScale = 2,
  allowNegative = false,
  showCurrencySymbol = true,
  onValueChange,
  value,
  ...props
}: CurrencyInputProps) {
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

      const floatValue = rawToFloat(cleaned, decimalSeparator)
      onValueChange?.({ floatValue, value: cleaned })
    },
    [decimalSeparator, validate, onValueChange],
  )

  return (
    <div
      className={cn(
        controlGroupSurfaceClassName,
        'has-[aria-invalid=true]:ring-destructive/20 dark:has-[aria-invalid=true]:ring-destructive/40 has-[aria-invalid=true]:border-destructive dark:has-[aria-invalid=true]:border-destructive/50 placeholder:text-muted-foreground flex h-7 w-full min-w-0 items-center py-0.5 text-sm has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[aria-invalid=true]:ring-2 md:text-xs/relaxed',
        className,
      )}
    >
      {showCurrencySymbol && prefix && (
        <span className="text-muted-foreground pr-1 pl-2 text-sm select-none md:text-xs/relaxed">
          {prefix}
        </span>
      )}
      <input
        data-slot="input"
        type="text"
        inputMode="decimal"
        value={rawValue}
        onChange={handleChange}
        className={cn(
          'min-w-0 flex-1 border-none bg-transparent px-0 py-0.5 text-sm outline-none md:text-xs/relaxed',
          (!showCurrencySymbol || !prefix) && 'pl-2',
          (!showCurrencySymbol || !suffix) && 'pr-2',
        )}
        {...props}
      />
      {showCurrencySymbol && suffix && (
        <span className="text-muted-foreground pr-2 pl-1 text-sm select-none md:text-xs/relaxed">
          {suffix}
        </span>
      )}
    </div>
  )
}
