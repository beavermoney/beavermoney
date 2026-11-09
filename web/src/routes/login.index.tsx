import { Trans } from '@lingui/react/macro'
import { LanguageSelector } from '@/components/language-selector'
import { LoginForm } from '@/components/login-form'
import { Logo } from '@/components/logo'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
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
      minHeight="100dvh"
      className="login-page app-safe-area app-scroll-content"
    >
      <header className="login-header">
        <Link to="/" aria-label="Beaver Money" className="login-brand">
          <Logo size={32} />
          <Text weight="semibold">Beaver Money</Text>
        </Link>
        <LanguageSelector compact />
      </header>
      <main className="login-main">
        <Theme theme={neutralTheme} mode="dark">
          <section className="login-story" aria-labelledby="login-story-title">
            <Stack direction="vertical" gap={8}>
              <Text type="supporting" color="secondary">
                <Trans>A little attention. A clearer picture.</Trans>
              </Text>
              <Heading
                level={2}
                type="display-1"
                id="login-story-title"
                textWrap="balance"
              >
                <Trans>
                  Your money,
                  <br />
                  made clearer.
                </Trans>
              </Heading>
              <Text
                as="p"
                color="secondary"
                className="login-story-description"
              >
                <Trans>
                  Keep track of the everyday. See how it all adds up. A
                  thoughtful place for your personal and household finances.
                </Trans>
              </Text>
            </Stack>
            <Stack direction="vertical" gap={0} className="login-principles">
              <Stack
                direction="horizontal"
                gap={6}
                paddingBlock={5}
                align="center"
                className="login-principle"
              >
                <Text type="supporting" color="secondary">
                  01
                </Text>
                <Text>
                  <Trans>Log with intention.</Trans>
                </Text>
              </Stack>
              <Stack
                direction="horizontal"
                gap={6}
                paddingBlock={5}
                align="center"
                className="login-principle"
              >
                <Text type="supporting" color="secondary">
                  02
                </Text>
                <Text>
                  <Trans>Bring your accounts together.</Trans>
                </Text>
              </Stack>
              <Stack
                direction="horizontal"
                gap={6}
                paddingBlock={5}
                align="center"
                className="login-principle"
              >
                <Text type="supporting" color="secondary">
                  03
                </Text>
                <Text>
                  <Trans>Build your dam, day by day.</Trans>
                </Text>
              </Stack>
            </Stack>
          </section>
        </Theme>
        <section className="login-entry" aria-labelledby="login-title">
          <Stack
            direction="vertical"
            gap={8}
            width="100%"
            className="login-form-content"
          >
            <Stack direction="vertical" gap={4}>
              <Text type="supporting" color="secondary">
                <Trans>YOUR NEXT CHAPTER</Trans>
              </Text>
              <Heading
                level={1}
                type="display-2"
                id="login-title"
                textWrap="balance"
              >
                <Trans>
                  Make yourself
                  <br />
                  at home.
                </Trans>
              </Heading>
              <Text as="p" color="secondary">
                <Trans>A clearer view of your money starts here.</Trans>
              </Text>
            </Stack>
            <Stack direction="vertical" gap={4}>
              <LoginForm />
              <Text as="p" type="supporting" color="secondary">
                <Trans>
                  One Google account. Your own space for the everyday.
                </Trans>
              </Text>
            </Stack>
          </Stack>
          <Text
            type="supporting"
            color="secondary"
            className="login-entry-note"
          >
            <Trans>Personal finances. Shared perspective.</Trans>
          </Text>
        </section>
      </main>
      <footer className="login-footer">
        <Text type="supporting" color="secondary">
          <Trans>Built with care. Built for clarity.</Trans>
        </Text>
        <a
          href="https://github.com/beavermoney/beavermoney"
          className="login-source"
        >
          <Trans>Open source on GitHub</Trans> ↗
        </a>
      </footer>
    </Stack>
  )
}
