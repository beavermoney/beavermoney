import { useMemo } from 'react'
import { graphql, useFragment } from 'react-relay'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useCurrency } from '@/hooks/use-currency'
import {
  calculateNextPaymentDate,
  formatNextPaymentDate,
} from '@/lib/date-range'
import currency from 'currency.js'

import type { subscriptionCardFragment$key } from './__generated__/subscriptionCardFragment.graphql'
import { Link } from '@tanstack/react-router'
import { getLogoDomainURL } from '@/lib/logo'
import { cn } from '@/lib/utils'

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
  className,
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
    <Item
      className={cn(className)}
      render={
        <Link
          className="no-underline!"
          from="/household/$householdId/"
          to="/household/$householdId/subscriptions/$subscriptionId"
          search={(prev) => ({ ...prev })}
          activeOptions={{ exact: true }}
          params={{ subscriptionId: data.id }}
        >
          {({ isActive }) => (
            <>
              <ItemMedia variant="image">
                <Avatar className="">
                  <AvatarImage
                    src={getLogoDomainURL(data.icon || '')}
                    alt={data.icon || 'unknown logo'}
                  />
                  <AvatarFallback>{data.name}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent className="gap-px">
                <ItemTitle className={cn(isActive && 'font-semibold')}>
                  {data.name}
                </ItemTitle>
                <ItemDescription>{intervalText}</ItemDescription>
              </ItemContent>
              <ItemContent className="items-end gap-px">
                <ItemTitle className="font-semibold tabular-nums">
                  {formatCurrencyWithPrivacyMode({
                    value: data.cost,
                    currencyCode: data.householdCurrency.code,
                  })}
                </ItemTitle>
                <ItemDescription>
                  {formatNextPaymentDate(nextPaymentDate)}
                </ItemDescription>
              </ItemContent>
            </>
          )}
        </Link>
      }
    />
  )
}
