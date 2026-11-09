import { Trans, useLingui } from '@lingui/react/macro'
import { PublicHeader } from '@/components/public-header'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { t, i18n } = useLingui()
  const exampleMoney = (amount: number) =>
    i18n.number(amount, { style: 'currency', currency: 'CAD' })
  return (
    <Stack direction="vertical" className="app-safe-area app-scroll-content">
      <PublicHeader />
      <main className="home-main">
        <Theme theme={neutralTheme} mode="dark">
          <section className="home-hero" aria-labelledby="home-title">
            <Stack direction="vertical" gap={8} className="home-hero-copy">
              <Text type="supporting" color="secondary">
                <Trans>A little attention. A clearer picture.</Trans>
              </Text>
              <Heading
                level={1}
                type="display-1"
                id="home-title"
                textWrap="balance"
              >
                <Trans>
                  Know your money.
                  <br />
                  Build your dam.
                </Trans>
              </Heading>
              <Text as="p" color="secondary">
                <Trans>
                  A thoughtful home for your money. Track the everyday, bring
                  your accounts together, and see the bigger picture.
                </Trans>
              </Text>
              <Stack direction="vertical" gap={3} align="start">
                <Button
                  href="/login"
                  label={t`Get started`}
                  size="lg"
                  variant="primary"
                />
                <Text type="supporting" color="secondary">
                  <Trans>For you. For your household. At your pace.</Trans>
                </Text>
              </Stack>
            </Stack>
            <Theme theme={neutralTheme} mode="light">
              <section
                className="home-ledger"
                aria-label={t`Example transaction ledger`}
              >
                <Stack
                  direction="horizontal"
                  justify="between"
                  align="center"
                  gap={4}
                >
                  <Text weight="semibold">
                    <Trans>The everyday, accounted for.</Trans>
                  </Text>
                  <Text type="supporting" color="secondary">
                    <Trans>EXAMPLE</Trans>
                  </Text>
                </Stack>
                <Stack direction="vertical" gap={2} paddingBlock={8}>
                  <Text type="supporting" color="secondary">
                    <Trans>Three moments. One clear record.</Trans>
                  </Text>
                  <Heading level={2} type="display-3">
                    <Trans>A day in your life</Trans>
                  </Heading>
                </Stack>
                <Stack direction="vertical" gap={0}>
                  {[
                    {
                      name: t`Morning coffee`,
                      category: t`Food & drink`,
                      amount: -5.5,
                    },
                    {
                      name: t`Weekly groceries`,
                      category: t`Household`,
                      amount: -68.4,
                    },
                    { name: t`Payday`, category: t`Income`, amount: 2400 },
                  ].map((entry, index) => (
                    <Stack
                      key={entry.name}
                      direction="horizontal"
                      justify="between"
                      align="center"
                      gap={4}
                      paddingBlock={5}
                      className="home-ledger-row"
                    >
                      <Stack direction="horizontal" gap={4} align="center">
                        <Text type="supporting" color="secondary">
                          0{index + 1}
                        </Text>
                        <Stack direction="vertical" gap={1}>
                          <Text weight="medium">{entry.name}</Text>
                          <Text type="supporting" color="secondary">
                            {entry.category}
                          </Text>
                        </Stack>
                      </Stack>
                      <Text className="home-ledger-amount">
                        {entry.amount > 0 ? '+' : ''}
                        {exampleMoney(entry.amount)}
                      </Text>
                    </Stack>
                  ))}
                </Stack>
                <Text
                  as="p"
                  type="supporting"
                  color="secondary"
                  className="home-ledger-caption"
                >
                  <Trans>Illustrative entries in Canadian dollars.</Trans>
                </Text>
              </section>
            </Theme>
          </section>
        </Theme>

        <section className="home-details" aria-labelledby="home-details-title">
          <Stack direction="vertical" gap={4} className="home-section-intro">
            <Text type="supporting" color="secondary">
              <Trans>SMALL HABITS. A BIGGER PICTURE.</Trans>
            </Text>
            <Heading
              level={2}
              type="display-2"
              id="home-details-title"
              textWrap="balance"
            >
              <Trans>
                Less scattered.
                <br />
                More understood.
              </Trans>
            </Heading>
            <Text as="p" color="secondary">
              <Trans>
                From your first coffee to your long-term investments, give every
                part of your finances a place.
              </Trans>
            </Text>
          </Stack>
          <Stack direction="vertical" gap={0}>
            {[
              {
                title: t`The details make the difference.`,
                description: t`Log income, expenses, and transfers with intention. Organize transactions into categories and keep recurring subscriptions in view.`,
                tags: t`Transactions · Categories · Subscriptions`,
              },
              {
                title: t`Your whole picture, in one place.`,
                description: t`Bring accounts, investments, and currencies into the same view. Follow your balances and understand how your money moves.`,
                tags: t`Accounts · Investments · Multiple currencies`,
              },
              {
                title: t`A shared life. A shared perspective.`,
                description: t`Manage a household together, with room for everyone's accounts. Keep the details connected so you can see the same bigger picture.`,
                tags: t`Households · Members · Shared clarity`,
              },
            ].map((feature, index) => (
              <Stack
                key={feature.title}
                direction="vertical"
                gap={4}
                paddingBlock={8}
                className="home-feature"
              >
                <Text type="supporting" color="secondary">
                  0{index + 1}
                </Text>
                <Heading level={3}>{feature.title}</Heading>
                <Text as="p" color="secondary">
                  {feature.description}
                </Text>
                <Text type="supporting" color="secondary">
                  {feature.tags}
                </Text>
              </Stack>
            ))}
          </Stack>
        </section>

        <section className="home-closing" aria-labelledby="home-closing-title">
          <Stack direction="vertical" gap={4}>
            <Text type="supporting" color="secondary">
              <Trans>OPEN SOURCE. OPEN POSSIBILITIES.</Trans>
            </Text>
            <Heading level={2} type="display-2" id="home-closing-title">
              <Trans>
                A little more clarity.
                <br />
                Starting today.
              </Trans>
            </Heading>
            <Text as="p" color="secondary">
              <Trans>
                Use Beaver Money for your everyday finances, or host it
                yourself. The code is open, and the choice is yours.
              </Trans>
            </Text>
          </Stack>
          <Stack direction="vertical" gap={4} align="start">
            <Button
              href="/login"
              label={t`Build your dam`}
              variant="primary"
              size="lg"
            />
            <Text type="supporting" color="secondary">
              <Trans>One entry at a time.</Trans>
            </Text>
          </Stack>
        </section>
      </main>
      <footer className="login-footer">
        <Text type="supporting" color="secondary">
          <Trans>Built with care. Built for clarity.</Trans>
        </Text>
        <Text type="supporting" color="secondary">
          © {new Date().getFullYear()} Beaver Money
        </Text>
      </footer>
    </Stack>
  )
}
