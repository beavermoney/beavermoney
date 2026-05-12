import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import currency from 'currency.js'
import { useCurrency } from '@/hooks/use-currency'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLogoTickerURL } from '@/lib/logo'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { investmentLotCardFragment$key } from './__generated__/investmentLotCardFragment.graphql'

const investmentLotCardFragment = graphql`
  fragment investmentLotCardFragment on InvestmentLot {
    id
    amount
    price
    investment {
      name
      symbol
      householdCurrency {
        code
      }
    }
    transaction {
      id
      category {
        name
      }
      datetime
    }
  }
`

export function InvestmentLotCard({
  fragmentRef,
  isFirst,
  isLast,
  onClick,
}: {
  fragmentRef: investmentLotCardFragment$key
  isFirst: boolean
  isLast: boolean
  onClick?: () => void
}) {
  const { formatCurrency } = useCurrency()

  const data = useFragment<investmentLotCardFragment$key>(
    investmentLotCardFragment,
    fragmentRef,
  )

  return (
    <Item
      variant="default"
      role={onClick ? 'button' : 'listitem'}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        !isFirst && 'rounded-t-none border-t-0',
        !isLast && 'rounded-b-none',
        onClick && 'hover:bg-muted cursor-pointer',
      )}
      key={data.id}
      id={data.id}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <ItemMedia variant="image">
        <Avatar>
          <AvatarImage
            src={getLogoTickerURL(data.investment.symbol || '')}
            alt={data.investment.symbol || 'unknown logo'}
          />
          <AvatarFallback>{data.investment.symbol}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className="gap-px">
        <ItemTitle className="">
          <span>{data.transaction.category.name}</span>
        </ItemTitle>
        <ItemDescription>
          {data.amount} {data.investment.name} @{' '}
          {formatCurrency({
            value: currency(data.price, { precision: 8 }),
            currencyCode: data.investment.householdCurrency.code,
          })}
        </ItemDescription>
      </ItemContent>
      <ItemContent className="items-end gap-px">
        <ItemTitle className="">
          <span className="font-semibold tabular-nums">
            {formatCurrency({
              value: currency(data.price, { precision: 8 }).multiply(
                currency(data.amount, { precision: 8 }),
              ),
              currencyCode: data.investment.householdCurrency.code,
            })}
          </span>
        </ItemTitle>
        <ItemDescription>
          {format(new Date(data.transaction.datetime), 'LLL d')}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
