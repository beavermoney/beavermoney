import { useLingui } from '@lingui/react'
import { formatLocalizedDate } from '@/lib/localized-date'

export function useDateFormatter() {
  const { i18n } = useLingui()
  const locale = i18n.locale
  return (date: Date, pattern: string) =>
    formatLocalizedDate(date, pattern, locale)
}
