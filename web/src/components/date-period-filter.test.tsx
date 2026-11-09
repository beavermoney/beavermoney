// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DatePeriodFilter } from './date-period-filter'
const preferences = vi.hoisted(() => ({ isMobile: false, weekStartsOn: 0 }))
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => preferences.isMobile,
}))
vi.mock('@/hooks/use-week-start', () => ({
  useWeekStart: () => ({ weekStartsOn: preferences.weekStartsOn }),
}))
beforeEach(() => {
  preferences.isMobile = false
  preferences.weekStartsOn = 0
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 9))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('closes the picker immediately and keeps old dates visible while a slow change is pending', async () => {
  let resolve!: () => void
  const change = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done
      }),
  )
  render(
    <DatePeriodFilter
      startDate="2026-08-01"
      endDate="2026-08-31"
      onDateRangeChange={change}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'August 2026' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Year' }))
  fireEvent.click(screen.getByRole('menuitem', { name: '2025' }))
  await waitFor(() =>
    expect(change).toHaveBeenCalledWith('2025-01-01', '2025-12-31'),
  )
  expect(screen.queryByRole('menu', { name: 'Year' })).toBeNull()
  expect(screen.getByRole('button', { name: 'August 2026' })).toBeTruthy()
  expect(
    screen.getByRole('progressbar', { name: 'Updating date range' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Next period' }))
  expect(change).toHaveBeenCalledTimes(1)
  await act(async () => resolve())
  await waitFor(() =>
    expect(
      screen.queryByRole('progressbar', { name: 'Updating date range' }),
    ).toBeNull(),
  )
})
it('keeps existing dates and shows a retryable error if loading fails', async () => {
  const change = vi.fn().mockRejectedValue(new Error('offline'))
  render(
    <DatePeriodFilter
      startDate="2026-08-01"
      endDate="2026-08-31"
      onDateRangeChange={change}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Next period' }))
  await screen.findByRole('alert')
  expect(screen.getByRole('button', { name: 'August 2026' })).toBeTruthy()
  await waitFor(() =>
    expect(
      screen.queryByRole('progressbar', { name: 'Updating date range' }),
    ).toBeNull(),
  )
})

it('keeps the view menu available and applies a month from the prior year grid', async () => {
  const change = vi.fn().mockResolvedValue(undefined)
  render(
    <DatePeriodFilter
      startDate="2026-08-01"
      endDate="2026-08-31"
      onDateRangeChange={change}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'August 2026' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Month' }))
  expect(screen.getByRole('menuitem', { name: 'Custom range' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Previous year' }))
  fireEvent.click(screen.getByRole('button', { name: 'February 2025' }))
  await waitFor(() =>
    expect(change).toHaveBeenCalledWith('2025-02-01', '2025-02-28'),
  )
})

it('can select older years from the scrolling menu', async () => {
  const change = vi.fn().mockResolvedValue(undefined)
  render(
    <DatePeriodFilter
      startDate="2026-08-01"
      endDate="2026-08-31"
      onDateRangeChange={change}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'August 2026' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Year' }))
  fireEvent.click(screen.getByRole('menuitem', { name: '2016' }))
  await waitFor(() =>
    expect(change).toHaveBeenCalledWith('2016-01-01', '2016-12-31'),
  )
})

it('shows months January to December with future months disabled and stops forward navigation at today', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 9))
  render(
    <DatePeriodFilter
      startDate="2026-11-01"
      endDate="2026-11-30"
      onDateRangeChange={vi.fn().mockResolvedValue(undefined)}
    />,
  )
  expect(
    screen
      .getByRole('button', { name: 'Next period' })
      .hasAttribute('disabled'),
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'November 2026' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Month' }))
  const months = screen
    .getAllByRole('button')
    .filter((button) => /2026$/.test(button.getAttribute('aria-label') ?? ''))
  expect(months.map((button) => button.getAttribute('aria-label'))).toEqual([
    'January 2026',
    'February 2026',
    'March 2026',
    'April 2026',
    'May 2026',
    'June 2026',
    'July 2026',
    'August 2026',
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
  ])
  expect(
    screen
      .getByRole('button', { name: 'December 2026' })
      .hasAttribute('disabled'),
  ).toBe(true)
})

it.each([false, true])(
  'uses the configured week start for relative labels and selection (mobile: %s)',
  async (isMobile) => {
    preferences.isMobile = isMobile
    preferences.weekStartsOn = 1
    vi.setSystemTime(new Date(2026, 0, 1))
    const change = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(
      <DatePeriodFilter
        startDate="2025-12-29"
        endDate="2026-01-04"
        onDateRangeChange={change}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'This week' }))
    fireEvent.click(
      screen.getByRole(isMobile ? 'button' : 'menuitem', { name: 'Week' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Last week' }))
    await waitFor(() =>
      expect(change).toHaveBeenCalledWith('2025-12-22', '2025-12-28'),
    )
    rerender(
      <DatePeriodFilter
        startDate="2025-12-22"
        endDate="2025-12-28"
        onDateRangeChange={change}
      />,
    )
    expect(screen.getByRole('button', { name: 'Last week' })).toBeTruthy()
  },
)
