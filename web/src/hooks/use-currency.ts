import currency from 'currency.js'
import { usePrivacyMode } from './use-privacy-mode'
import { useHousehold } from './use-household'

type FormatCurrencyArgs = {
  value: string | currency
  currencyCode: string
  liability?: boolean
}

export function useCurrency() {
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const { household } = useHousehold()

  const formatCurrency = ({
    value,
    currencyCode,
    liability,
  }: FormatCurrencyArgs) => {
    const curr =
      typeof value === 'string' ? currency(value, { precision: 8 }) : value

    const formatted = Intl.NumberFormat(household.locale, {
      currency: currencyCode,
      style: 'currency',
    }).format(liability ? -curr.value : curr.value)

    return formatted
  }

  const formatCurrencyWithPrivacyMode = (args: FormatCurrencyArgs) => {
    if (isPrivacyModeEnabled) {
      return '•••••••'
    }

    return formatCurrency(args)
  }

  return { formatCurrency, formatCurrencyWithPrivacyMode }
}
