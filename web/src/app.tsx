import { getHistoryViewKey } from '@/lib/history-view-key'
import { AppI18nProvider } from '@/components/app-i18n-provider'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { routeTree } from './routeTree.gen'

import { ThemeProvider } from '@/components/theme-provider'
import * as Sentry from '@sentry/react'
import { LOCAL_STORAGE_THEME_KEY } from './constant'
import { env } from './env'
import './styles.css'
import { retireOfflineCache } from './lib/retire-offline-cache'

void retireOfflineCache().catch(() => {
  // Storage may be unavailable; never block the online app from starting.
})

Sentry.init({
  dsn: env.VITE_SENTRY_DSN,
  sendDefaultPii: true,
})

const router = createRouter({
  routeTree,
  context: {},
  defaultPendingMs: Infinity,
  defaultPendingMinMs: 0,
  defaultPreload: 'intent',
  defaultStructuralSharing: true,
  defaultViewTransition: false,
  scrollRestoration: true,
  getScrollRestorationKey: getHistoryViewKey,
  scrollRestorationBehavior: 'instant',
  scrollToTopSelectors: [
    '[data-scroll-restoration-id="page-content"]',
    '[data-scroll-restoration-id="transaction-table"]',
  ],
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export async function mountApp(onCommit: () => void) {
  // Keep the fixed HTML startup surface until the first route is ready.
  await router.load()
  const rootElement = document.getElementById('app')
  if (!rootElement) throw new Error('Application root is missing')
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AppI18nProvider>
        <ThemeProvider
          defaultTheme="system"
          storageKey={LOCAL_STORAGE_THEME_KEY}
        >
          <section
            className="contents"
            ref={(node) => {
              if (node) onCommit()
            }}
          >
            <RouterProvider router={router} />
          </section>
        </ThemeProvider>
      </AppI18nProvider>
    </StrictMode>,
  )
}
