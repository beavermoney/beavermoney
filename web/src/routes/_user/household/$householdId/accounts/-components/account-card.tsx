import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { Link, LinkOptions } from '@tanstack/react-router'
import type { accountCardFragment$key } from './__generated__/accountCardFragment.graphql'
import { cn } from '@/lib/utils'

import { useCurrency } from '@/hooks/use-currency'
import { getPrettyTime } from '@/lib/time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoDomainURL } from '@/lib/logo'
import currency from 'currency.js'

import { Progress } from '@/components/ui/progress'

const accountCardFragment = graphql`
  fragment accountCardFragment on Account {
    id
    name
    type
    icon
    updateTime
    currency {
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
  className,
}: AccountCardProps) {
  const data = useFragment(accountCardFragment, fragmentRef)

  const balance = currency(data.balance)
  const value = currency(data.value)

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const showProgress =
    data.type === 'investment' && balance.value != 0 && value.value != 0

  const investmentPercentage =
    showProgress && value.value !== 0
      ? Number(((1 - balance.value / value.value) * 100).toFixed(2))
      : 0

  return (
    <Link
      className={cn(
        'hover:bg-muted flex flex-col gap-1.5 rounded-md border border-transparent p-3 text-xs/relaxed no-underline! transition-colors',
        className,
      )}
      from="/household/$householdId/"
      to="/household/$householdId/accounts/$accountId"
      search={(prev) => ({ ...prev })}
      activeOptions={{ exact: true }}
      activeProps={{ className: 'border-border' }}
      params={{ accountId: data.id }}
      {...linkOptions}
    >
      <div className="flex items-center gap-2">
        <Avatar className="size-6 text-[0.5rem]">
          <AvatarImage
            src={getLogoDomainURL(data.icon || '')}
            alt={data.icon || 'unknown logo'}
          />
          <AvatarFallback>{data.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 font-medium">{data.name}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrencyWithPrivacyMode({
            value: data.value,
            currencyCode: data.currency.code,
            liability: data.type === 'liability',
          })}
        </span>
      </div>
      <div className="text-muted-foreground flex items-center gap-1.5 text-[0.6875rem]">
        <span>{data.user.name}</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{getPrettyTime(new Date(data.updateTime))}</span>
      </div>
      {showProgress && (
        <div className="mt-0.5 flex flex-col gap-1">
          <Progress value={investmentPercentage} className="h-1.5" />
          <div className="text-muted-foreground flex justify-between text-[0.625rem]">
            <span>Invested {investmentPercentage}%</span>
            <span className="tabular-nums">
              {formatCurrencyWithPrivacyMode({
                value: data.balance,
                currencyCode: data.currency.code,
              })}{' '}
              cash
            </span>
          </div>
        </div>
      )}
    </Link>
  )
}
