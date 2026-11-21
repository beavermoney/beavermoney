import { PendingTransactionIcon } from '@/components/pending-transaction-icon'
import { useDateFormatter } from '@/hooks/use-date-formatter'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { useCurrency } from '@/hooks/use-currency'
import { Avatar } from '@astryxdesign/core/Avatar'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'

import { getLogoTickerURL } from '@/lib/logo'
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
      pending
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
  showDate = true,
  onClick,
}: {
  fragmentRef: investmentLotCardFragment$key
  isFirst: boolean
  isLast: boolean
  showDate?: boolean
  onClick?: () => void
}) {
  const { formatCurrencyWithPrivacyMode: formatCurrency } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const format = useDateFormatter()
  const data = useFragment<investmentLotCardFragment$key>(
    investmentLotCardFragment,
    fragmentRef,
  )

  const shares = isPrivacyModeEnabled ? '•••' : data.amount

  return (
    <ListItem
      id={data.id}
      label={data.transaction.category.name}
      description={
        data.transaction.category.name === 'Move'
          ? `${shares} ${data.investment.name}`
          : `${shares} ${data.investment.name} @ ${formatCurrency({ value: currency(data.price, { precision: 8 }), currencyCode: data.investment.householdCurrency.code })}`
      }
      startContent={
        <Avatar
          src={getLogoTickerURL(data.investment.symbol || '')}
          name={data.investment.name}
        />
      }
      onClick={onClick}
      endContent={
        <VStack gap={1} hAlign="end">
          <HStack gap={1} vAlign="center">
            {data.transaction.pending && <PendingTransactionIcon />}
            <Text type="label" hasTabularNumbers>
              {data.transaction.category.name === 'Move'
                ? shares
                : formatCurrency({
                    value: currency(data.price, { precision: 8 }).multiply(
                      currency(data.amount, { precision: 8 }),
                    ),
                    currencyCode: data.investment.householdCurrency.code,
                  })}
            </Text>
          </HStack>
          {showDate && (
            <Text type="supporting">
              {format(new Date(data.transaction.datetime), 'LLL d')}
            </Text>
          )}
        </VStack>
      }
    />
  )
}
