import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { graphql, usePaginationFragment } from 'react-relay'
import invariant from 'tiny-invariant'

import { ItemGroup } from '@/components/ui/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { useUser } from '@/hooks/use-user'

import { calculateNextPaymentDate } from '@/lib/date-range'
import currency from 'currency.js'

import { SubscriptionCard } from './subscription-card'

import type { subscriptionsPanelFragment$key } from './__generated__/subscriptionsPanelFragment.graphql'
import { PlusButton } from '@/components/plus-button'
import { NodeType, useRegisterConnection } from '@/lib/relay'

const SubscriptionsPanelFragment = graphql`
  fragment subscriptionsPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    viewUserId: { type: "ID" }
  )
  @refetchable(queryName: "subscriptionsPanelRefetch") {
    recurringSubscriptions(
      first: $count
      after: $cursor
      where: { userID: $viewUserId }
    ) @connection(key: "subscriptionsPanel_recurringSubscriptions") {
      __id
      edges {
        node {
          id
          active
          cost
          householdCurrency {
            code
          }
          interval
          intervalCount
          startDate
          name
          ...subscriptionCardFragment
        }
      }
    }
  }
`

type SubscriptionsPanelProps = {
  fragmentRef: subscriptionsPanelFragment$key
}

const SORT_OPTIONS = {
  cost_high: 'Cost (High to Low)',
  cost_low: 'Cost (Low to High)',
  next_payment: 'Next Payment',
  name_az: 'Name (A-Z)',
  name_za: 'Name (Z-A)',
} as const

type SortOption = keyof typeof SORT_OPTIONS

export function SubscriptionsPanel({ fragmentRef }: SubscriptionsPanelProps) {
  const { data } = usePaginationFragment(
    SubscriptionsPanelFragment,
    fragmentRef,
  )
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const navigate = useNavigate()
  const { householdId } = useParams({ from: '/_user/household/$householdId' })
  const { viewUserId } = useHouseholdViewScope()
  const { user } = useUser()
  const isViewingOtherUser = viewUserId !== null && viewUserId !== user.id

  useRegisterConnection(
    data.recurringSubscriptions.__id,
    NodeType.RecurringSubscription,
  )

  const search = useSearch({
    from: '/_user/household/$householdId/subscriptions',
  })
  const sortBy = search.sort_by

  const handleSortChange = (newSortBy: string | null) => {
    if (!newSortBy) return
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        sort_by: newSortBy as SortOption,
      }),
    })
  }

  invariant(
    data.recurringSubscriptions,
    'recurringSubscriptions connection must be defined',
  )

  const { monthlyAverage, yearlyAverage, activeCount, sortedSubscriptions } =
    useMemo(() => {
      const edges = data.recurringSubscriptions.edges ?? []
      const activeSubscriptions = edges
        .filter((edge) => {
          return edge?.node?.active
        })
        .map((edge) => {
          invariant(edge?.node, 'subscription node must not be null')
          return edge.node
        })

      const getYearlyEquivalent = (sub: (typeof activeSubscriptions)[0]) => {
        const costInDisplayCurrency = convert(
          sub.cost,
          sub.householdCurrency.code,
        )
        switch (sub.interval) {
          case 'week':
            return costInDisplayCurrency.divide(sub.intervalCount).multiply(52)
          case 'month':
            return costInDisplayCurrency.divide(sub.intervalCount).multiply(12)
          case 'year':
            return costInDisplayCurrency.divide(sub.intervalCount)
          default:
            invariant(false, `unexpected interval type: ${sub.interval}`)
        }
      }

      const yearlyTotal = activeSubscriptions.reduce((total, sub) => {
        return total.add(getYearlyEquivalent(sub))
      }, currency(0))

      const totalMonthly = yearlyTotal.divide(12)

      const subscriptionsToSort = [...activeSubscriptions]

      subscriptionsToSort.sort((a, b) => {
        switch (sortBy) {
          case 'cost_high': {
            return getYearlyEquivalent(b).value - getYearlyEquivalent(a).value
          }
          case 'cost_low': {
            return getYearlyEquivalent(a).value - getYearlyEquivalent(b).value
          }
          case 'next_payment': {
            const aNext = calculateNextPaymentDate({
              startDate: a.startDate,
              interval: a.interval,
              intervalCount: a.intervalCount,
            })
            const bNext = calculateNextPaymentDate({
              startDate: b.startDate,
              interval: b.interval,
              intervalCount: b.intervalCount,
            })
            return aNext.getTime() - bNext.getTime()
          }
          case 'name_az':
            return a.name.localeCompare(b.name)
          case 'name_za':
            return b.name.localeCompare(a.name)
          default:
            invariant(false, `unexpected sort option: ${sortBy}`)
        }
      })

      return {
        monthlyAverage: totalMonthly,
        yearlyAverage: yearlyTotal,
        activeCount: activeSubscriptions.length,
        sortedSubscriptions: subscriptionsToSort,
      }
    }, [data, sortBy, convert])

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-2 lg:absolute">
        <PlusButton
          to="/household/$householdId/subscriptions/new"
          params={{ householdId }}
          disabled={isViewingOtherUser}
          disabledTitle="Switch to your view to create"
          data-testid="new-subscription-button"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[0.6875rem] font-medium tracking-wider uppercase">
          Monthly Spend
        </span>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatCurrencyWithPrivacyMode({
            value: monthlyAverage,
            currencyCode: displayCurrencyCode,
          })}
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs tabular-nums">
          <span>
            {formatCurrencyWithPrivacyMode({
              value: yearlyAverage,
              currencyCode: displayCurrencyCode,
            })}{' '}
            <span className="text-muted-foreground/60">yearly</span>
          </span>
          <span>
            {activeCount}{' '}
            <span className="text-muted-foreground/60">
              {activeCount === 1 ? 'subscription' : 'subscriptions'}
            </span>
          </span>
        </div>
      </div>

      <div className="py-2"></div>

      <div className="flex items-center">
        <div className="grow"></div>
        <Select
          name="sort-subscriptions"
          value={sortBy}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue>{SORT_OPTIONS[sortBy]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.entries(SORT_OPTIONS) as [SortOption, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="py-2"></div>

      <div className="overflow-hidden rounded-md border">
        <ItemGroup className="gap-0">
          {sortedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              fragmentRef={subscription}
              className="rounded-none"
            />
          ))}
        </ItemGroup>
      </div>
    </Fragment>
  )
}
