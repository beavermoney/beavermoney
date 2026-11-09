import { i18n } from '@lingui/core'
import { messages as english } from '@/locales/en/messages.po'
import { messages as chinese } from '@/locales/zh-CN/messages.po'

export type AppLocale = 'en' | 'zh-CN'
export const LANGUAGE_STORAGE_KEY = 'beaver-language'

// Only Simplified Chinese is available; do not silently treat Traditional
// Chinese preferences as a request for Simplified Chinese.
export function resolveLocale(languages: readonly string[]): AppLocale {
  for (const language of languages) {
    const locale = language.toLowerCase()
    if (
      locale === 'zh' ||
      locale === 'zh-cn' ||
      locale === 'zh-sg' ||
      locale.startsWith('zh-hans')
    )
      return 'zh-CN'
    if (locale === 'en' || locale.startsWith('en-')) return 'en'
  }
  return 'en'
}

export function initialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved === 'en' || saved === 'zh-CN') return saved
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  return resolveLocale(
    typeof navigator === 'undefined' ? [] : navigator.languages,
  )
}

i18n.load({ en: english, 'zh-CN': chinese })

export function activateLocale(locale: AppLocale, persist = true) {
  i18n.activate(locale)
  if (typeof document !== 'undefined') document.documentElement.lang = locale
  if (persist && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    } catch {
      /* The in-memory preference still works. */
    }
  }
}

activateLocale(initialLocale(), false)
export { i18n }
