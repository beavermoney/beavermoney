import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { routeTree } from './routeTree.gen'

import { ThemeProvider } from '@/components/theme-provider'
import * as Sentry from '@sentry/react'
import { LOCAL_STORAGE_THEME_KEY } from './constant'
import { env } from './env'
import './styles.css'

Sentry.init({
  dsn: env.VITE_SENTRY_DSN,
  sendDefaultPii: true,
})

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  defaultStructuralSharing: true,
  defaultViewTransition: false,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey={LOCAL_STORAGE_THEME_KEY}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>,
  )
}
