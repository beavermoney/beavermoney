import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import pluginRelay from 'eslint-plugin-relay'
import pluginRouter from '@tanstack/eslint-plugin-router'

export default defineConfig([
  { ignores: ['ios/**', 'dist/**', 'build/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      pluginRelay.configs.recommended,
    ],
    plugins: { relay: pluginRelay, '@tanstack/router': pluginRouter },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: [
                'useEffect',
                'useLayoutEffect',
                'useInsertionEffect',
              ],
              message:
                'Effects are banned in app code. Use event handlers, derived state, external-store subscriptions, or DOM ref cleanup.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'MemberExpression[property.name=/^use(Effect|LayoutEffect|InsertionEffect)$/]',
          message: 'React effect hooks are banned, including namespace access.',
        },
        {
          selector:
            'MemberExpression[computed=true][property.value=/^use(Effect|LayoutEffect|InsertionEffect)$/]',
          message: 'React effect hooks are banned, including computed access.',
        },
        {
          selector:
            'ObjectPattern > Property[key.name=/^use(Effect|LayoutEffect|InsertionEffect)$/]',
          message: 'Do not destructure effect hooks.',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
