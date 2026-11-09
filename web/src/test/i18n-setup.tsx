import { beforeEach, vi } from 'vitest'
import { AppI18nProvider } from '@/components/app-i18n-provider'
import { activateLocale } from '@/lib/i18n'

beforeEach(() => activateLocale('en', false))

// Component tests use the same translation context as the application.
vi.mock('@testing-library/react', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@testing-library/react')>()
  return {
    ...original,
    render: ((
      ui: React.ReactNode,
      options?: import('@testing-library/react').RenderOptions,
    ) => {
      const Wrapper = options?.wrapper
      return original.render(ui, {
        ...options,
        wrapper: ({ children }) => (
          <AppI18nProvider>
            {Wrapper ? <Wrapper>{children}</Wrapper> : children}
          </AppI18nProvider>
        ),
      })
    }) as typeof original.render,
  }
})
