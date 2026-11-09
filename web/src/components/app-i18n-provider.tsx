import { I18nProvider, useLingui } from '@lingui/react'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import chinese from '@astryxdesign/core/locales/zh-CN.generated.js'
import type { ReactNode } from 'react'
import { i18n } from '@/lib/i18n'

const messages = { 'zh-CN': chinese }
function ComponentLocale({ children }: { children: ReactNode }) {
  const { i18n } = useLingui()
  return (
    <InternationalizationProvider locale={i18n.locale} messages={messages}>
      {children}
    </InternationalizationProvider>
  )
}

export function AppI18nProvider({ children }: { children: ReactNode }) {
  return (
    <I18nProvider i18n={i18n}>
      <ComponentLocale>{children}</ComponentLocale>
    </I18nProvider>
  )
}
