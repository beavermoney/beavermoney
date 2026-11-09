import { describe, expect, it } from 'vitest'
import { parseISO } from 'date-fns'
import { detectPeriod, periodRange, weekDays, dateKey } from './date-period'

describe('date periods', () => {
  it('uses Sunday by default and supports Monday across a year boundary', () => {
    expect(periodRange('week', parseISO('2027-01-01'), 0)).toEqual([
      '2026-12-27',
      '2027-01-02',
    ])
    expect(periodRange('week', parseISO('2027-01-01'), 1)).toEqual([
      '2026-12-28',
      '2027-01-03',
    ])
  })
  it('includes leap day in February and uses inclusive year endpoints', () => {
    expect(periodRange('month', parseISO('2028-02-10'), 0)).toEqual([
      '2028-02-01',
      '2028-02-29',
    ])
    expect(periodRange('year', parseISO('2028-02-10'), 0)).toEqual([
      '2028-01-01',
      '2028-12-31',
    ])
  })
  it('recognizes calendar and custom ranges without changing local dates', () => {
    expect(detectPeriod('2026-11-09', '2026-11-09', 0)).toBe('calendar')
    expect(detectPeriod('2026-11-08', '2026-11-14', 0)).toBe('week')
    expect(detectPeriod('2026-11-08', '2026-11-14', 1)).toBe('custom')
    expect(detectPeriod('2026-11-01', '2026-11-30', 0)).toBe('month')
    expect(detectPeriod('2026-01-01', '2026-12-31', 0)).toBe('year')
  })
  it('keeps seven consecutive local dates across daylight saving time', () => {
    expect(weekDays(parseISO('2026-11-01'), 0).map(dateKey)).toEqual([
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
    ])
  })
})
