import { Avatar } from '@astryxdesign/core/Avatar'
import { VStack } from '@astryxdesign/core/Layout'
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
import { getLogoDomainURL } from '@/lib/logo'
import { getRelativeDate } from '@/lib/time'

const AccountLedgerRowFragment = graphql`
  fragment accountLedgerRowFragment on Account {
    id
    name
    type
    icon
    value
    balance
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
  const data = useFragment(AccountLedgerRowFragment, fragmentRef)
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
  const location = {
    to: '/household/$householdId/accounts/$accountId' as const,
    params: { householdId: household.id, accountId: data.id },
  }
  return (
    <ListItem
      label={data.name}
      description={`${data.user.name} · ${data.householdCurrency.code} · ${data.latestTransaction ? getRelativeDate(new Date(data.latestTransaction.datetime)) : 'No activity yet'}`}
      startContent={
        <Avatar src={getLogoDomainURL(data.icon || '')} name={data.name} />
      }
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {displayed}
          </Text>
          {data.type === 'investment' && (
            <Text type="supporting">
              Cash{' '}
              {formatCurrencyWithPrivacyMode({
                value: data.balance,
                currencyCode: data.householdCurrency.code,
              })}
            </Text>
          )}
          <Text type="supporting" hasTabularNumbers>
            {data.householdCurrency.code !== displayCurrencyCode
              ? `${original} · `
              : ''}
            {formatPercentageWithPrivacyMode(
              share,
              household.locale,
              isPrivacyModeEnabled,
            )}
          </Text>
        </VStack>
      }
      href={router.buildLocation(location).href}
      onClick={(event) => {
        if (
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0
        ) {
          event.preventDefault()
          void router.navigate(location)
        }
      }}
    />
  )
}
