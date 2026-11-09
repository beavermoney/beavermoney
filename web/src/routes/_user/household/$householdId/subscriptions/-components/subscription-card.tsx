import { useLingui } from '@lingui/react/macro'
import { plural } from '@lingui/core/macro'
import { RouterListItem } from '@/components/router-list-item'
import { Avatar } from '@astryxdesign/core/Avatar'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { graphql, useFragment } from 'react-relay'

import { useCurrency } from '@/hooks/use-currency'
import {
  calculateNextPaymentDate,
  formatNextPaymentDate,
} from '@/lib/date-range'

import { getLogoDomainURL } from '@/lib/logo'
import type { subscriptionCardFragment$key } from './__generated__/subscriptionCardFragment.graphql'

const SubscriptionCardFragment = graphql`
  fragment subscriptionCardFragment on RecurringSubscription {
    id
    name
    icon
    cost
    interval
    intervalCount
    startDate
    householdCurrency {
      code
    }
  }
`

type SubscriptionCardProps = {
  fragmentRef: subscriptionCardFragment$key
  isActive?: boolean
  className?: string
}

export function SubscriptionCard({
  fragmentRef,
  isActive = true,
  className: _className,
}: SubscriptionCardProps) {
  const { t, i18n } = useLingui()

  const data = useFragment(SubscriptionCardFragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const count = data.intervalCount
  const intervalText = (() => {
    switch (data.interval) {
      case 'week':
        return t({
          message: plural(count, { one: 'Every week', other: 'Every # weeks' }),
        })
      case 'month':
        return t({
          message: plural(count, {
            one: 'Every month',
            other: 'Every # months',
          }),
        })
      case 'year':
        return t({
          message: plural(count, { one: 'Every year', other: 'Every # years' }),
        })
    }
  })()
  const nextPaymentDate = calculateNextPaymentDate({
    startDate: data.startDate,
    interval: data.interval,
    intervalCount: count,
  })

  return (
    <RouterListItem
      from="/household/$householdId"
      to="/household/$householdId/subscriptions/$subscriptionId"
      params={{ subscriptionId: data.id }}
      label={<Text maxLines={2}>{data.name}</Text>}
      startContent={
        <Avatar src={getLogoDomainURL(data.icon || '')} name={data.name} />
      }
      description={isActive ? intervalText : t`Inactive · ${intervalText}`}
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {formatCurrencyWithPrivacyMode({
              value: data.cost,
              currencyCode: data.householdCurrency.code,
            })}
          </Text>
          {isActive && (
            <Text type="supporting" color="secondary">
              {formatNextPaymentDate(nextPaymentDate, i18n.locale)}
            </Text>
          )}
        </VStack>
      }
    />
  )
}
