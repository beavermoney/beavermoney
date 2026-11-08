import { useCurrency } from '@/hooks/use-currency'
import { Avatar } from '@astryxdesign/core/Avatar'
import { VStack } from '@astryxdesign/core/Layout'
import { ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'

import { getLogoTickerURL } from '@/lib/logo'
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
  isFirst: _isFirst,
  isLast: _isLast,
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
    <ListItem
      id={data.id}
      label={data.transaction.category.name}
      description={`${data.amount} ${data.investment.name} @ ${formatCurrency({ value: currency(data.price, { precision: 8 }), currencyCode: data.investment.householdCurrency.code })}`}
      startContent={
        <Avatar
          src={getLogoTickerURL(data.investment.symbol || '')}
          name={data.investment.name}
        />
      }
      onClick={onClick}
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {formatCurrency({
              value: currency(data.price, { precision: 8 }).multiply(
                currency(data.amount, { precision: 8 }),
              ),
              currencyCode: data.investment.householdCurrency.code,
            })}
          </Text>
          <Text type="supporting">
            {format(new Date(data.transaction.datetime), 'LLL d')}
          </Text>
        </VStack>
      }
    />
  )
}
