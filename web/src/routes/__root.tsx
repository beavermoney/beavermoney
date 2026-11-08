import { PwaUpdatePrompt } from '@/components/pwa-update-prompt'
import { AstryxRouterProvider } from '@/components/astryx-router-provider'
import { NotificationListener } from '@/components/notification-listener'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { ToastViewport } from '@astryxdesign/core/Toast'

import { env } from '@/env'
import { environment } from '@/environment'
import { useIsMobile } from '@/hooks/use-mobile'
import { PrivacyModeProvider } from '@/hooks/use-privacy-mode'
import { RelayEnvironmentProvider } from 'react-relay'
import '../styles.css'

export const Route = createRootRoute({
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  return (
    <RelayEnvironmentProvider environment={environment}>
      <PrivacyModeProvider>
        <ToastViewport position={isMobile ? 'topEnd' : 'bottomEnd'}>
          <NotificationListener />
          <PwaUpdatePrompt />
          <AstryxRouterProvider>{children}</AstryxRouterProvider>
          {import.meta.env.VITE_SHOW_DEVTOOLS === 'true' && (
            <TanStackDevtools
              eventBusConfig={{ port: env.VITE_DEVTOOLS_PORT }}
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          )}
        </ToastViewport>
      </PrivacyModeProvider>
    </RelayEnvironmentProvider>
  )
}
