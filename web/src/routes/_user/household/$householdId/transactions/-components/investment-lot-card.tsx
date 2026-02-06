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
      currency {
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
}: {
  fragmentRef: investmentLotCardFragment$key
  isFirst: boolean
  isLast: boolean
}) {
  const { formatCurrency } = useCurrency()

  const data = useFragment<investmentLotCardFragment$key>(
    investmentLotCardFragment,
    fragmentRef,
  )

  return (
    <Item
      variant="default"
      role="listitem"
      className={cn(
        !isFirst && 'rounded-t-none border-t-0',
        !isLast && 'rounded-b-none',
      )}
      key={data.id}
      id={data.id}
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
          {format(new Date(data.transaction.datetime), 'LLL d, iiii')}
        </ItemDescription>
      </ItemContent>
      <ItemContent className="items-end gap-px">
        <ItemTitle className="">
          <span className="tabular-nums">
            {formatCurrency({
              value: currency(data.price).multiply(currency(data.amount)),
              currencyCode: data.investment.currency.code,
            })}
          </span>
        </ItemTitle>
        <ItemDescription>
          {data.amount} {data.investment.name} @{' '}
          {formatCurrency({
            value: currency(data.price),
            currencyCode: data.investment.currency.code,
          })}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
