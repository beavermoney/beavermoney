// @vitest-environment jsdom
import '@/test/browser-setup'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { TextInput } from '@astryxdesign/core/TextInput'
import { LanguageSelector } from './language-selector'
import { DatePeriodFilter } from './date-period-filter'
import { AccountTypePicker } from '@/routes/_user/household/$householdId/accounts/-components/account-type-picker'
import { activateLocale, initialLocale, LANGUAGE_STORAGE_KEY } from '@/lib/i18n'

vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/hooks/use-week-start', () => ({
  useWeekStart: () => ({ weekStartsOn: 1 }),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
  activateLocale('en', false)
})

function Draft() {
  const [name, setName] = useState('')
  return <TextInput label="Draft account" value={name} onChange={setName} />
}

describe('app language preference', () => {
  it('switches real controls without losing drafts, and saves the choice for startup', () => {
    const onValueChange = vi.fn()
    render(
      <>
        <LanguageSelector />
        <Draft />
        <AccountTypePicker
          value="liquidity"
          onValueChange={onValueChange}
          onBlur={() => {}}
          labelledBy="type-label"
        />
        <DatePeriodFilter
          startDate="2026-11-01"
          endDate="2026-11-30"
          onDateRangeChange={async () => {}}
        />
      </>,
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Draft account' }), {
      target: { value: '旅行账户' },
    })
    expect(screen.getByRole('button', { name: 'November 2026' })).toBeTruthy()
    fireEvent.click(screen.getByRole('combobox', { name: 'Language' }))
    fireEvent.click(screen.getByRole('option', { name: '简体中文' }))
    expect(
      screen.getByRole('combobox', { name: '语言' }).textContent,
    ).toContain('简体中文')
    expect(screen.getByRole('button', { name: '2026年11月' })).toBeTruthy()
    expect(
      screen.getByRole('textbox', { name: 'Draft account' }),
    ).toHaveProperty('value', '旅行账户')
    expect(screen.getByRole('radio', { name: /流动资金/ })).toHaveProperty(
      'checked',
      true,
    )
    fireEvent.click(screen.getByRole('radio', { name: /负债/ }))
    expect(onValueChange).toHaveBeenCalledWith('liability')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('zh-CN')
    expect(initialLocale()).toBe('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
    act(() => activateLocale('en'))
    expect(screen.getByRole('button', { name: 'November 2026' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Liquidity/ })).toBeTruthy()
  })
})
