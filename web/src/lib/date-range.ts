import { RecurringSubscriptionInterval } from '@/routes/_user/household/$householdId/subscriptions/-components/__generated__/subscriptionCardFragment.graphql'
import {
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  isAfter,
  isSameDay,
  parseISO,
  startOfDay,
  startOfToday,
} from 'date-fns'

export const DATE_RANGE_PRESETS = {
  THIS_MONTH: 'THIS_MONTH',
  LAST_MONTH: 'LAST_MONTH',
  THIS_YEAR: 'THIS_YEAR',
  LAST_YEAR: 'LAST_YEAR',
} as const

export type DateRangePreset =
  (typeof DATE_RANGE_PRESETS)[keyof typeof DATE_RANGE_PRESETS]

export const getDefaultDates = () => {
  const range = getDateRangeForPreset(DATE_RANGE_PRESETS.THIS_MONTH)
  return {
    start: format(range.startDate, 'yyyy-MM-dd'),
    end: format(range.endDate, 'yyyy-MM-dd'),
  }
}

/**
 * Get UTC date range for common time period presets
 */
export function getDateRangeForPreset(preset: DateRangePreset): {
  startDate: Date
  endDate: Date
} {
  const now = new Date()

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  switch (preset) {
    case DATE_RANGE_PRESETS.THIS_MONTH: {
      const start = new Date(
        startOfToday.getFullYear(),
        startOfToday.getMonth(),
        1,
      )
      const end = new Date(
        startOfToday.getFullYear(),
        startOfToday.getMonth() + 1,
        0,
      )
      return { startDate: start, endDate: end }
    }

    case DATE_RANGE_PRESETS.LAST_MONTH: {
      const start = new Date(
        startOfToday.getFullYear(),
        startOfToday.getMonth() - 1,
        1,
      )
      const end = new Date(
        startOfToday.getFullYear(),
        startOfToday.getMonth(),
        0,
      )
      return { startDate: start, endDate: end }
    }

    case DATE_RANGE_PRESETS.THIS_YEAR: {
      const start = new Date(startOfToday.getFullYear(), 0, 1)
      const end = new Date(startOfToday.getFullYear(), 11, 31)
      return { startDate: start, endDate: end }
    }

    case DATE_RANGE_PRESETS.LAST_YEAR: {
      const start = new Date(startOfToday.getFullYear() - 1, 0, 1)
      const end = new Date(startOfToday.getFullYear() - 1, 11, 31)
      return { startDate: start, endDate: end }
    }

    default:
      throw new Error(`Unsupported date range preset: ${preset}`)
  }
}

/**
 * Convert date range to ISO strings for GraphQL
 */
export function dateRangeToISO(range: { startDate: Date; endDate: Date }): {
  startDate: string
  endDate: string
} {
  return {
    startDate: range.startDate.toISOString(),
    endDate: range.endDate.toISOString(),
  }
}

/**
 * Parse date strings from URL and convert to ISO strings for GraphQL
 * Falls back to default preset if parsing fails
 */
export function parseDateRangeFromURL(
  start: string,
  end: string,
  fallbackPreset: DateRangePreset = DATE_RANGE_PRESETS.THIS_MONTH,
): {
  startDate: string
  endDate: string
} {
  try {
    // Import parseISO dynamically to avoid circular dependency
    const startDate = parseISO(start)
    const endDate = parseISO(end)

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date values')
    }

    return {
      startDate: startDate.toISOString(),
      endDate: new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate() + 1,
      ).toISOString(),
    }
  } catch (error) {
    console.error('Failed to parse date range from URL:', { start, end, error })
    const range = getDateRangeForPreset(fallbackPreset)
    return dateRangeToISO(range)
  }
}

/**
 * Calculate next payment date for recurring subscription
 * Handles day folding (Jan 31 → Feb 28/29) and preserves original day when possible
 */
export function calculateNextPaymentDate(params: {
  startDate: Date | string
  interval: RecurringSubscriptionInterval
  intervalCount: number
}): Date {
  const { startDate, interval, intervalCount } = params

  // Strip time component - subscriptions are date-only (year, month, day)
  const start = startOfDay(
    typeof startDate === 'string' ? parseISO(startDate) : startDate,
  )
  const today = startOfToday()

  if (isAfter(start, today) || isSameDay(start, today)) {
    return start
  }

  // Calculate periods elapsed since start
  const periodsElapsed = (() => {
    switch (interval) {
      case 'week': {
        const daysSinceStart = differenceInDays(today, start)
        return Math.floor(daysSinceStart / (intervalCount * 7))
      }
      case 'month':
        return Math.floor(differenceInMonths(today, start) / intervalCount)
      case 'year':
        return Math.floor(differenceInYears(today, start) / intervalCount)
      default:
        throw new Error(`Unknown interval: ${interval}`)
    }
  })()

  const periodsToAdd = (periodsElapsed + 1) * intervalCount

  let nextDate: Date
  switch (interval) {
    case 'week':
      nextDate = addWeeks(start, periodsToAdd)
      break
    case 'month': {
      nextDate = addMonths(start, periodsToAdd)
      break
    }
    case 'year': {
      nextDate = addYears(start, periodsToAdd)
      break
    }
    default:
      throw new Error(`Unknown interval: ${interval}`)
  }

  return nextDate
}

/**
 * Format payment date for display
 * Returns "today", "tomorrow", or "in X days" if within 7 days, otherwise formatted date
 */
export function formatNextPaymentDate(date: Date): string {
  const paymentDate = startOfDay(date)
  const today = startOfToday()
  const daysUntil = differenceInDays(paymentDate, today)

  // Handle dates within the next 7 days with day-level precision only
  if (daysUntil >= 0 && daysUntil <= 7) {
    if (daysUntil === 0) {
      return 'today'
    }
    if (daysUntil === 1) {
      return 'tomorrow'
    }
    // Format as "in X days" (day-level precision only, no hours)
    return `in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`
  }

  return format(paymentDate, 'MMM d, yyyy')
}
