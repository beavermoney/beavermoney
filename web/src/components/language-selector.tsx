import { useLingui } from '@lingui/react/macro'
import { Selector } from '@astryxdesign/core/Selector'
import { activateLocale } from '@/lib/i18n'

export function LanguageSelector() {
  const { i18n, t } = useLingui()
  return (
    <Selector
      label={t`Language`}
      presentation="adaptive"
      value={i18n.locale}
      onChange={(value) => {
        if (value === 'en' || value === 'zh-CN') activateLocale(value)
      }}
      options={[
        { value: 'en', label: 'English' },
        { value: 'zh-CN', label: '简体中文' },
      ]}
    />
  )
}
