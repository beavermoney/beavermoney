import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import { LOCAL_STORAGE_THEME_KEY } from './constant'
import { ThemeProvider } from '@/components/theme-provider'
import * as Sentry from '@sentry/react'
import { env } from './env'

Sentry.init({
  dsn: env.VITE_SENTRY_DSN,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  defaultStructuralSharing: true,
  defaultViewTransition: false,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey={LOCAL_STORAGE_THEME_KEY}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>,
  )
}
