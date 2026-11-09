import {
  addDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import type { WeekStart } from '@/hooks/use-week-start'

export type DatePeriod = 'week' | 'month' | 'year' | 'calendar' | 'custom'
export const dateKey = (date: Date) => format(date, 'yyyy-MM-dd')
export function periodRange(
  mode: Exclude<DatePeriod, 'custom'>,
  date: Date,
  weekStartsOn: WeekStart,
): [string, string] {
  switch (mode) {
    case 'week':
      return [
        dateKey(startOfWeek(date, { weekStartsOn })),
        dateKey(endOfWeek(date, { weekStartsOn })),
      ]
    case 'month':
      return [dateKey(startOfMonth(date)), dateKey(endOfMonth(date))]
    case 'year':
      return [dateKey(startOfYear(date)), dateKey(endOfYear(date))]
    case 'calendar':
      return [dateKey(date), dateKey(date)]
  }
}
export function detectPeriod(
  start: string,
  end: string,
  weekStartsOn: WeekStart,
): DatePeriod {
  for (const mode of ['calendar', 'month', 'year', 'week'] as const) {
    const range = periodRange(mode, parseISO(start), weekStartsOn)
    if (range[0] === start && range[1] === end) return mode
  }
  return 'custom'
}
export function weekDays(date: Date, weekStartsOn: WeekStart) {
  const first = startOfWeek(date, { weekStartsOn })
  return Array.from({ length: 7 }, (_, i) => addDays(first, i))
}
