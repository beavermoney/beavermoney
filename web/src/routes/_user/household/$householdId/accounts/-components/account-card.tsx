import { Avatar } from '@astryxdesign/core/Avatar'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Link, LinkOptions } from '@tanstack/react-router'
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
  linkOptions?: LinkOptions
  className?: string
}

export function AccountCard({
  fragmentRef,
  linkOptions,
  className: _className,
}: AccountCardProps) {
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
    <Link
      from="/household/$householdId"
      to="/household/$householdId/accounts/$accountId"
      search={(prev) => ({ ...prev })}
      activeOptions={{ exact: true }}

      params={{ accountId: data.id }}
      {...linkOptions}
    >
      <Stack direction="horizontal" gap={2} align="center">
        <Avatar
          src={getLogoDomainURL(data.icon || '')}
          alt={data.icon || 'unknown logo'}
          name={String(data.name.slice(0, 2))}
        />
        <span>{data.name}</span>
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
        <span>{data.user.name}</span>
        <Text type="supporting">·</Text>
        <span>
          {data.latestTransaction
            ? getRelativeDate(new Date(data.latestTransaction.datetime))
            : 'Never used'}
        </span>
      </Stack>
      {showProgress && (
        <Stack direction="vertical" gap={1}>
          <ProgressBar
            value={investmentPercentage}

            label="Invested"
          />
          <Stack direction="horizontal" justify="between">
            <span>Invested {investmentPercentage}%</span>
            <Text hasTabularNumbers>
              {formatCurrencyWithPrivacyMode({
                value: data.balance,
                currencyCode: data.householdCurrency.code,
              })}{' '}
              cash
            </Text>
          </Stack>
        </Stack>
      )}
    </Link>
  )
}
