import { AccountAvatar } from '@/components/account-avatar'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
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
  const { t, i18n } = useLingui()
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
      description={`${data.householdCurrency.code} · ${data.latestTransaction ? getRelativeDate(new Date(data.latestTransaction.datetime), i18n.locale) : t`No activity yet`}`}
      startContent={<AccountAvatar account={data} />}
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {original}
          </Text>
          {data.type === 'investment' && (
            <Text type="supporting">
              <Trans>Cash</Trans>{' '}
              {formatCurrencyWithPrivacyMode({
                value: data.balance,
                currencyCode: data.householdCurrency.code,
              })}
            </Text>
          )}
          <Text type="supporting" hasTabularNumbers>
            {data.householdCurrency.code !== displayCurrencyCode
              ? `${displayed} · `
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
