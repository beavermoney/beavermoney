import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { Link } from '@tanstack/react-router'
import type { investmentCardFragment$key } from './__generated__/investmentCardFragment.graphql'
import { cn } from '@/lib/utils'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useCurrency } from '@/hooks/use-currency'
import { getPrettyTime } from '@/lib/time'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoTickerURL } from '@/lib/logo'

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
    amount
    value
  }
`

type InvestmentCardProps = {
  fragmentRef: investmentCardFragment$key
  className?: string
}

export function InvestmentCard({
  fragmentRef,
  className,
}: InvestmentCardProps) {
  const data = useFragment(investmentCardFragment, fragmentRef)

  const { formatCurrencyWithPrivacyMode, formatCurrency } = useCurrency()

  return (
    <Item
      className={cn(className)}
      render={
        <Link
          className="no-underline!"
          from="/household/$householdId/"
          to="/household/$householdId/investments/$investmentId"
          search={(prev) => ({ ...prev })}
          activeOptions={{ exact: true }}
          params={{ investmentId: data.id }}
        >
          {({ isActive }) => (
            <>
              <ItemMedia variant="image">
                <Avatar className="">
                  <AvatarImage
                    src={getLogoTickerURL(data.symbol || '')}
                    alt={data.symbol || 'unknown logo'}
                  />
                  <AvatarFallback>{data.symbol}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent className="gap-px">
                <ItemTitle className={cn(isActive && 'font-semibold')}>
                  {data.name}
                </ItemTitle>
                <ItemDescription>
                  {data.amount} @{' '}
                  {formatCurrency({
                    value: data.quote,
                    currencyCode: data.householdCurrency.code,
                  })}
                </ItemDescription>
              </ItemContent>
              <ItemContent className="items-end gap-px">
                <ItemTitle className="">
                  <span className="font-semibold tabular-nums">
                    {formatCurrencyWithPrivacyMode({
                      value: data.value,
                      currencyCode: data.householdCurrency.code,
                    })}
                  </span>
                </ItemTitle>
                <ItemDescription className="">
                  <span>{getPrettyTime(new Date(data.updateTime))}</span>
                </ItemDescription>
              </ItemContent>
            </>
          )}
        </Link>
      }
    />
  )
}
