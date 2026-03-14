import currency from 'currency.js'
import { usePrivacyMode } from './use-privacy-mode'
import { useHousehold } from './use-household'

type FormatCurrencyArgs = {
  value: string | currency
  currencyCode: string
  liability?: boolean
  numberFormatOptions?: Omit<Intl.NumberFormatOptions, 'currency' | 'style'>
  privacyMaskLength?: number
}

export function useCurrency() {
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const { household } = useHousehold()

  const formatCurrency = ({
    value,
    currencyCode,
    liability,
    numberFormatOptions,
  }: FormatCurrencyArgs) => {
    const curr =
      typeof value === 'string' ? currency(value, { precision: 8 }) : value

    const formatted = Intl.NumberFormat(household.locale, {
      currency: currencyCode,
      style: 'currency',
      ...numberFormatOptions,
    }).format(liability ? -curr.value : curr.value)

    return formatted
  }

  const formatCurrencyWithPrivacyMode = ({
    privacyMaskLength = 7,
    ...args
  }: FormatCurrencyArgs) => {
    if (isPrivacyModeEnabled) {
      return '•'.repeat(privacyMaskLength)
    }

    return formatCurrency(args)
  }

  return { formatCurrency, formatCurrencyWithPrivacyMode }
}
