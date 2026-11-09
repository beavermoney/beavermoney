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
import { afterEach, expect, it, vi } from 'vitest'
import { DatePeriodFilter } from './date-period-filter'
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/hooks/use-week-start', () => ({
  useWeekStart: () => ({ weekStartsOn: 0 }),
}))
afterEach(cleanup)
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
  fireEvent.click(screen.getByRole('button', { name: 'View by year' }))
  fireEvent.click(screen.getByRole('button', { name: '2025' }))
  await waitFor(() =>
    expect(change).toHaveBeenCalledWith('2025-01-01', '2025-12-31'),
  )
  expect(screen.queryByRole('dialog', { name: 'View by year' })).toBeNull()
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
