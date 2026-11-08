import { CategoryIcon } from '@/components/category-icon'
import { useCurrency } from '@/hooks/use-currency'
import { Badge } from '@astryxdesign/core/Badge'
import { VStack } from '@astryxdesign/core/Layout'
import { ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'

import { format } from 'date-fns'
import { transactionEntryCardFragment$key } from './__generated__/transactionEntryCardFragment.graphql'

const transactionEntryCardFragment = graphql`
  fragment transactionEntryCardFragment on TransactionEntry {
    id
    amount
    account {
      name
      householdCurrency {
        code
      }
    }
    transaction {
      id
      excludeFromReports
      category {
        name
        type
        icon
      }
      datetime
    }
  }
`

export function TransactionEntryCard({
  fragmentRef,
  isFirst: _isFirst,
  isLast: _isLast,
  onClick,
}: {
  fragmentRef: transactionEntryCardFragment$key
  isFirst: boolean
  isLast: boolean
  onClick?: () => void
}) {
  const { formatCurrency } = useCurrency()

  const data = useFragment<transactionEntryCardFragment$key>(
    transactionEntryCardFragment,
    fragmentRef,
  )

  return (
    <ListItem
      id={data.id}
      label={data.transaction.category.name}
      description={data.account.name}
      startContent={
        <CategoryIcon
          type={data.transaction.category.type}
          icon={data.transaction.category.icon}
        />
      }
      onClick={onClick}
      endContent={
        <VStack gap={1} hAlign="end">
          <Text type="label" hasTabularNumbers>
            {formatCurrency({
              value: data.amount,
              currencyCode: data.account.householdCurrency.code,
            })}
          </Text>
          <Text type="supporting">
            {format(new Date(data.transaction.datetime), 'LLL d')}
          </Text>
          {data.transaction.excludeFromReports && <Badge label="Excluded" />}
        </VStack>
      }
    />
  )
}
