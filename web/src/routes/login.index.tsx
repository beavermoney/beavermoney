import { Trans, useLingui } from '@lingui/react/macro'
import { LanguageSelector } from '@/components/language-selector'
import { LoginForm } from '@/components/login-form'
import { Logo } from '@/components/logo'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLingui()
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
        <Stack direction="horizontal" gap={2} align="center">
          <LanguageSelector compact />
          <IconButton
            href="https://github.com/beavermoney/beavermoney"
            label={t`Open source on GitHub`}
            tooltip={t`Open source on GitHub`}
            variant="ghost"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .297a12 12 0 0 0-3.793 23.385c.6.111.82-.261.82-.577v-2.234c-3.338.725-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.419-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.323 3.301 1.23a11.52 11.52 0 0 1 6.006 0c2.291-1.553 3.297-1.23 3.297-1.23.654 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297Z" />
              </svg>
            }
          />
        </Stack>
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
      </footer>
    </Stack>
  )
}
