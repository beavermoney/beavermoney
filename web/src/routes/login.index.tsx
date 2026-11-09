import { Trans } from '@lingui/react/macro'
import { LanguageSelector } from '@/components/language-selector'
import { LoginForm } from '@/components/login-form'
import { Logo } from '@/components/logo'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Stack
      direction="vertical"
      gap={10}
      align="center"
      justify="center"
      minHeight="100dvh"
      className="app-safe-area app-scroll-content"
    >
      <Stack direction="vertical" gap={6} align="center" padding={6}>
        <Link to="/" className="text-center">
          <Stack direction="vertical" gap={6} align="center">
            <Logo size={96} />
            <Stack direction="vertical" gap={1} align="center">
              <Heading level={1}>
                <Trans>Log your transactions.</Trans>
                <br />
                <Trans>Build your dam.</Trans>
              </Heading>
              <Text as="p" display="block" color="secondary">
                <Trans>Login with your Google account</Trans>
              </Text>
            </Stack>
          </Stack>
        </Link>
        <LoginForm />
        <LanguageSelector />
      </Stack>
    </Stack>
  )
}
