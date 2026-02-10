import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Toaster } from '@/components/ui/sonner'

import '../styles.css'
import { RelayEnvironmentProvider } from 'react-relay'
import { environment } from '@/environment'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { PrivacyModeProvider } from '@/hooks/use-privacy-mode'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createRootRoute({
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  return (
    <RelayEnvironmentProvider environment={environment}>
      <PrivacyModeProvider>
        {children}
        <TanStackDevtools
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
        <TailwindIndicator />
        <Toaster position={isMobile ? 'top-right' : 'bottom-right'} />
      </PrivacyModeProvider>
    </RelayEnvironmentProvider>
  )
}
