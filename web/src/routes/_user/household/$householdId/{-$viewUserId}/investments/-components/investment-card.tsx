import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { Link, LinkOptions } from '@tanstack/react-router'
import currency from 'currency.js'
import type { investmentCardFragment$key } from './__generated__/investmentCardFragment.graphql'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/hooks/use-currency'
import { getPrettyTime } from '@/lib/time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoTickerURL } from '@/lib/logo'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'

const investmentCardFragment = graphql`
  fragment investmentCardFragment on Investment {
    id
    name
    symbol
    quote
    updateTime
    householdCurrency {
      code
    }
    user {
      name
    }
    amount
    value
    unrealizedReturn
    unrealizedReturnPercent
  }
`

type InvestmentCardProps = {
  fragmentRef: investmentCardFragment$key
  linkOptions?: LinkOptions
  className?: string
}

export function InvestmentCard({
  fragmentRef,
  linkOptions,
  className,
}: InvestmentCardProps) {
  const data = useFragment(investmentCardFragment, fragmentRef)

  const { formatCurrencyWithPrivacyMode, formatCurrency } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const hasShares = currency(data.amount).value !== 0
  const unrealizedReturn = currency(data.unrealizedReturn, { precision: 8 })
  const unrealizedReturnPercent = parseFloat(data.unrealizedReturnPercent) * 100
  const isPositive = unrealizedReturn.value > 0
  const isNegative = unrealizedReturn.value < 0

  const formattedReturn = formatCurrencyWithPrivacyMode({
    value: data.unrealizedReturn,
    currencyCode: data.householdCurrency.code,
  })
  const formattedPercent = isPrivacyModeEnabled
    ? '•••'
    : ` ${Math.abs(unrealizedReturnPercent).toFixed(2)}%`
  const signedPercent = isPositive
    ? `+${formattedPercent}`
    : isNegative
      ? `−${formattedPercent}`
      : formattedPercent

  const returnClassName = cn(
    'flex items-center gap-1.5 text-[0.6875rem] font-medium tabular-nums',
    isPositive && 'text-emerald-600 dark:text-emerald-400',
    isNegative && 'text-red-600 dark:text-red-400',
    !isPositive && !isNegative && 'text-muted-foreground',
  )

  return (
    <Link
      className={cn(
        'hover:bg-muted flex flex-col gap-1.5 rounded-md border border-transparent p-3 text-xs/relaxed no-underline! transition-colors',
        className,
      )}
      from="/household/$householdId/{-$viewUserId}"
      to="/household/$householdId/{-$viewUserId}/investments/$investmentId"
      search={(prev) => ({ ...prev })}
      activeOptions={{ exact: true }}
      activeProps={{ className: 'border-border' }}
      params={{ investmentId: data.id }}
      {...linkOptions}
    >
      <div className="flex items-center gap-2">
        <Avatar className="size-6 text-[0.5rem]">
          <AvatarImage
            src={getLogoTickerURL(data.symbol || '')}
            alt={data.symbol || 'unknown logo'}
          />
          <AvatarFallback>{data.symbol}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 font-medium">{data.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrencyWithPrivacyMode({
            value: data.value,
            currencyCode: data.householdCurrency.code,
          })}
        </span>
      </div>
      <div className="text-muted-foreground flex items-center gap-1.5 text-[0.6875rem]">
        <span className="tabular-nums">
          {isPrivacyModeEnabled ? '•••' : data.amount} @{' '}
          {formatCurrency({
            value: data.quote,
            currencyCode: data.householdCurrency.code,
          })}
        </span>
        <span className="text-muted-foreground/40">·</span>
      </div>
      {hasShares && (
        <div className={returnClassName}>
          <span>
            {formattedReturn} ({signedPercent})
          </span>
        </div>
      )}

      <div className="text-muted-foreground flex items-center gap-1.5 text-[0.6875rem]">
        <span>{data.user.name}</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{getPrettyTime(new Date(data.updateTime))}</span>
      </div>
    </Link>
  )
}
