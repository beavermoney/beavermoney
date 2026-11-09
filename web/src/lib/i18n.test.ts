// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  i18n,
  activateLocale,
  initialLocale,
  resolveLocale,
  LANGUAGE_STORAGE_KEY,
} from './i18n'
import { getRelativeDate } from './time'
import { formatLocalizedDate } from './localized-date'
import { formatNextPaymentDate } from './date-range'
import { messages } from '@/locales/zh-CN/messages.po'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  localStorage.clear()
  activateLocale('en', false)
})

describe('locale selection and formatting', () => {
  it.each([
    [['zh-CN'], 'zh-CN'],
    [['zh-SG'], 'zh-CN'],
    [['zh-Hans-CA'], 'zh-CN'],
    [['en-CA', 'zh-CN'], 'en'],
    [['fr-CA', 'zh-CN'], 'zh-CN'],
    [['zh-TW'], 'en'],
    [['unsupported'], 'en'],
    [[], 'en'],
  ])('resolves %j to %s', (languages, expected) => {
    expect(resolveLocale(languages as string[])).toBe(expected)
  })

  it('honors only supported stored preferences and tolerates unavailable storage', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'zh-CN')
    expect(initialLocale()).toBe('zh-CN')
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'not-a-locale')
    expect(initialLocale()).toBe(resolveLocale(navigator.languages))
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => activateLocale('zh-CN')).not.toThrow()
    expect(i18n.locale).toBe('zh-CN')
    expect(initialLocale()).toBe(resolveLocale(navigator.languages))
  })

  it('loads a translated catalog and formats Chinese dates while preserving ISO keys', () => {
    activateLocale('zh-CN', false)
    expect(Object.keys(messages).length).toBeGreaterThan(500)
    const date = new Date(2026, 10, 9)
    expect(formatLocalizedDate(date, 'MMM d, yyyy', 'zh-CN')).toBe(
      '2026年11月9日',
    )
    expect(formatLocalizedDate(date, 'yyyy-MM-dd', 'zh-CN')).toBe('2026-11-09')
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 9, 12))
    expect(getRelativeDate(new Date(2026, 10, 7))).toBe('2天前')
    expect(formatNextPaymentDate(new Date(2026, 10, 12))).toBe('3 天后')
  })
})
