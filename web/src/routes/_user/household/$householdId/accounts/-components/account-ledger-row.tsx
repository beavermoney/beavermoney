import { useHistoryState } from '@/hooks/use-history-state'
import { Button } from '@astryxdesign/core/Button'
import { AccountAvatar } from '@/components/account-avatar'
import { useLingui } from '@lingui/react/macro'
import Decimal from 'decimal.js'
import { rankInvestmentHoldings } from '@/lib/investment-shortcuts'
import { Link } from '@astryxdesign/core/Link'
import { RouterButton } from '@/components/router-button'
import { InvestmentIcon } from '@/components/investment-icon'
import { HorizontalChipRail } from '@/components/horizontal-chip-rail'
import { Stack } from '@astryxdesign/core/Stack'
import { ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'
import { useRouter } from '@tanstack/react-router'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'

import type { accountLedgerRowFragment$key } from './__generated__/accountLedgerRowFragment.graphql'
import { formatPercentageWithPrivacyMode } from './account-ledger-utils'

import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { getRelativeDate } from '@/lib/time'

const AccountLedgerRowFragment = graphql`
  fragment accountLedgerRowFragment on Account {
    id
    name
    type
    icon
    value
    balance
    investments {
      id
      name
      type
      symbol
      amount
      value
      householdCurrency {
        code
      }
    }
    household {
      householdRates {
        rate
        fromCurrency {
          code
        }
        toCurrency {
          code
        }
      }
    }
    latestTransaction {
      datetime
    }
    householdCurrency {
      code
    }
    user {
      name
    }
  }
`

type AccountLedgerRowProps = {
  fragmentRef: accountLedgerRowFragment$key
  displayValue: currency
  displayCurrencyCode: string
  share: number | null
}

export function AccountLedgerRow({
  fragmentRef,
  displayValue,
  displayCurrencyCode,
  share,
}: AccountLedgerRowProps) {
  const { t, i18n } = useLingui()
  const data = useFragment(AccountLedgerRowFragment, fragmentRef)
  const [showAllHoldings, setShowAllHoldings] = useHistoryState(
    `account-holdings:${data.id}`,
    false,
  )
  const router = useRouter()
  const { household } = useHousehold()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const original = formatCurrencyWithPrivacyMode({
    value: data.value,
    currencyCode: data.householdCurrency.code,
    liability: data.type === 'liability',
  })
  const displayed = formatCurrencyWithPrivacyMode({
    value: displayValue,
    currencyCode: displayCurrencyCode,
    liability: data.type === 'liability',
  })
  const cashPercentage = new Decimal(data.value).gt(0)
    ? new Decimal(data.balance).div(data.value).mul(100).toNumber()
    : null
  const holdings = rankInvestmentHoldings(
    (data.investments ?? []).map((holding) => ({
      id: holding.id,
      name: holding.name,
      symbol: holding.symbol,
      type: holding.type,
      amount: holding.amount,
      value: holding.value,
      householdCurrency: holding.householdCurrency,
    })),
    data.householdCurrency.code,
    (data.household.householdRates ?? []).map((rate) => ({
      rate: rate.rate,
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
    })),
  )
  const percentage = (value: number | null) =>
    formatPercentageWithPrivacyMode(
      value,
      household.locale,
      isPrivacyModeEnabled,
    )
  const metadata = `${data.householdCurrency.code} · ${data.latestTransaction ? getRelativeDate(new Date(data.latestTransaction.datetime), i18n.locale) : t`No activity yet`}`
  const topHoldings = showAllHoldings ? holdings : holdings.slice(0, 3)
  const otherCount = holdings.length - topHoldings.length
  const location = {
    to: '/household/$householdId/accounts/$accountId' as const,
    params: { householdId: household.id, accountId: data.id },
  }
  return (
    <ListItem
      label={
        <Stack direction="vertical" gap={3} className="min-w-0">
          <Link
            href={router.buildLocation(location).href}
            color="primary"
            display="block"
            className="block! no-underline!"
          >
            <Stack direction="horizontal" gap={3} align="center">
              <AccountAvatar
                account={{ name: data.name, icon: data.icon, user: data.user }}
              />
              <Stack direction="vertical" gap={1} className="min-w-0 flex-1">
                <Stack
                  direction="horizontal"
                  justify="between"
                  align="start"
                  gap={3}
                >
                  <Text className="min-w-0" maxLines={2}>
                    {data.name}
                  </Text>
                  <Text type="label" hasTabularNumbers textWrap="nowrap">
                    {original}
                  </Text>
                </Stack>
                <Stack
                  direction="horizontal"
                  justify="between"
                  align="start"
                  gap={3}
                >
                  <Text type="supporting" className="min-w-0" maxLines={1}>
                    {metadata}
                  </Text>
                  <Text type="supporting" hasTabularNumbers justify="end">
                    {data.householdCurrency.code !== displayCurrencyCode
                      ? `${displayed} · `
                      : ''}
                    {percentage(share)}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Link>
          {data.type === 'investment' && (
            <Stack
              direction="horizontal"
              justify="between"
              align="center"
              gap={3}
            >
              <Stack className="min-w-0 flex-1">
                {topHoldings.length ? (
                  <HorizontalChipRail label={t`Investment shortcuts`}>
                    {topHoldings.map((holding) => (
                      <RouterButton
                        key={holding.id}
                        to="/household/$householdId/investments/$investmentId"
                        params={{
                          householdId: household.id,
                          investmentId: holding.id,
                        }}
                        label={holding.symbol}
                        size="sm"
                        variant="secondary"
                        icon={
                          <Stack aria-hidden="true">
                            <InvestmentIcon
                              symbol={holding.symbol}
                              name={holding.name}
                              type={holding.type}
                              tooltip={false}
                            />
                          </Stack>
                        }
                      />
                    ))}
                    {otherCount > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        label={t`+${otherCount} more`}
                        onClick={() => setShowAllHoldings(true)}
                      />
                    )}
                  </HorizontalChipRail>
                ) : (
                  <Text type="supporting">{t`No holdings`}</Text>
                )}
              </Stack>
              <Text
                type="supporting"
                hasTabularNumbers
                justify="end"
                className="max-w-32 shrink-0 sm:max-w-none"
              >
                {t`Cash`}{' '}
                {formatCurrencyWithPrivacyMode({
                  value: data.balance,
                  currencyCode: data.householdCurrency.code,
                })}{' '}
                · {percentage(cashPercentage)}
              </Text>
            </Stack>
          )}
        </Stack>
      }
    />
  )
}
