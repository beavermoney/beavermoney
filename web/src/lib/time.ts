import { t } from '@lingui/core/macro'
import { i18n } from '@lingui/core'
const EARLIEST_DATE = new Date(0)

export function getPrettyTime(givenDate: Date, locale = i18n.locale): string {
  if (givenDate <= EARLIEST_DATE) return t`Never`
  const seconds = Math.floor((Date.now() - givenDate.getTime()) / 1000)
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
  if (seconds < 60) return relative.format(-seconds, 'second')
  if (seconds < 3600)
    return relative.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400)
    return relative.format(-Math.floor(seconds / 3600), 'hour')
  return relative.format(-Math.floor(seconds / 86400), 'day')
}

export function getRelativeDate(givenDate: Date, locale = i18n.locale): string {
  if (givenDate <= EARLIEST_DATE) return t`Never`
  const days = Math.max(
    0,
    Math.floor((Date.now() - givenDate.getTime()) / 86400000),
  )
  if (days === 0) return t`Today`
  if (days === 1) return t`Yesterday`
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
  if (days < 30) return relative.format(-days, 'day')
  const months = Math.floor(days / 30)
  if (months < 12) return relative.format(-months, 'month')
  return relative.format(-Math.floor(days / 365), 'year')
}

export const getFormattedDate = (date: Date): string => {
  // Extract the year, month, and day
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0')

  // Format the date as yyyy-mm-dd
  return `${year}-${month}-${day}`
}
