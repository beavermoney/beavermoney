import { formatter } from '@lingui/format-po'
import { defineConfig } from '@lingui/cli'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'zh-CN'],
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['<rootDir>/src'],
      exclude: ['**/*.test.*', '**/__generated__/**', '**/locales/**'],
    },
  ],
  format: formatter({ lineNumbers: false }),
})
