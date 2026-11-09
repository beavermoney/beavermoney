import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Avatar } from '@astryxdesign/core/Avatar'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import type { accountCardFragment$key } from './__generated__/accountCardFragment.graphql'

import { useCurrency } from '@/hooks/use-currency'
import { getRelativeDate } from '@/lib/time'

import { getLogoDomainURL } from '@/lib/logo'
import currency from 'currency.js'

const accountCardFragment = graphql`
  fragment accountCardFragment on Account {
    id
    name
    type
    icon
    latestTransaction {
      datetime
    }
    householdCurrency {
      code
    }
    user {
      name
    }
    value
    balance
  }
`

type AccountCardProps = {
  fragmentRef: accountCardFragment$key
}

export function AccountCard({ fragmentRef }: AccountCardProps) {
  const { t, i18n } = useLingui()
  const data = useFragment(accountCardFragment, fragmentRef)

  const balance = currency(data.balance)
  const value = currency(data.value)

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const showProgress =
    data.type === 'investment' && balance.value != 0 && value.value != 0

  const investmentPercentage =
    showProgress && value.value !== 0
      ? Math.min(
          Number(((1 - balance.value / value.value) * 100).toFixed(2)),
          99.99,
        )
      : 0

  return (
    <Stack
      direction="vertical"
      gap={3}
      aria-labelledby={`account-${data.id}-name`}
    >
      <Stack direction="horizontal" gap={2} align="center">
        <Avatar
          src={getLogoDomainURL(data.icon || '')}
          alt={data.icon || 'unknown logo'}
          name={String(data.name.slice(0, 2))}
        />
        <Heading level={2} id={`account-${data.id}-name`}>
          {data.name}
        </Heading>
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Text type="label" hasTabularNumbers>
          {formatCurrencyWithPrivacyMode({
            value: data.value,
            currencyCode: data.householdCurrency.code,
            liability: data.type === 'liability',
          })}
        </Text>
      </Stack>
      <Stack direction="horizontal" gap={1.5} align="center">
        <Text color="secondary">{data.user.name}</Text>
        <Text type="supporting">·</Text>
        <Text color="secondary">
          {data.latestTransaction
            ? getRelativeDate(
                new Date(data.latestTransaction.datetime),
                i18n.locale,
              )
            : t`No activity yet`}
        </Text>
      </Stack>
      {showProgress && (
        <Stack direction="vertical" gap={1}>
          <ProgressBar
            value={investmentPercentage}

            label={t`Invested`}
          />
          <Stack direction="horizontal" justify="between">
            <span>
              <Trans>Invested </Trans>
              {investmentPercentage}%
            </span>
            <Text hasTabularNumbers>
              {formatCurrencyWithPrivacyMode({
                value: data.balance,
                currencyCode: data.householdCurrency.code,
              })}{' '}
              <Trans>cash</Trans>
            </Text>
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}
