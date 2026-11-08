import { RouterListItem } from '@/components/router-list-item'
import { Avatar } from '@astryxdesign/core/Avatar'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'

import { useCurrency } from '@/hooks/use-currency'
import {
  calculateNextPaymentDate,
  formatNextPaymentDate,
} from '@/lib/date-range'
import currency from 'currency.js'

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
  className?: string
}

export function SubscriptionCard({
  fragmentRef,
  className: _className,
}: SubscriptionCardProps) {
  const data = useFragment(SubscriptionCardFragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const { intervalText, nextPaymentDate } = useMemo(() => {
    // Convert cost to household currency
    const cost = currency(data.cost)

    // Format interval text
    const count = data.intervalCount
    const interval = data.interval
    const intervalText =
      count === 1
        ? `Every ${interval}`
        : `Every ${count} ${interval}${count > 1 ? 's' : ''}`

    // Calculate next payment date
    const nextDate = calculateNextPaymentDate({
      startDate: data.startDate,
      interval: data.interval,
      intervalCount: data.intervalCount,
    })

    return {
      costInHouseholdCurrency: cost,
      intervalText,
      nextPaymentDate: nextDate,
    }
  }, [data.cost, data.interval, data.intervalCount, data.startDate])

  return (
    <RouterListItem
      from="/household/$householdId"
      to="/household/$householdId/subscriptions/$subscriptionId"
      params={{ subscriptionId: data.id }}
      label={data.name}
      startContent={
        <Avatar src={getLogoDomainURL(data.icon || '')} name={data.name} />
      }
      description={intervalText}
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {formatCurrencyWithPrivacyMode({
              value: data.cost,
              currencyCode: data.householdCurrency.code,
            })}
          </Text>
          <Text type="supporting">
            {formatNextPaymentDate(nextPaymentDate)}
          </Text>
        </VStack>
      }
    />
  )
}
