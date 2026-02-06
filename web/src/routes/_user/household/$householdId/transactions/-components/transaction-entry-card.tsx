import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { useCurrency } from '@/hooks/use-currency'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { transactionEntryCardFragment$key } from './__generated__/transactionEntryCardFragment.graphql'
import { TransactionCategoryType } from './__generated__/transactionCardFragment.graphql'
import { match } from 'ts-pattern'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import {
  ArrowLeftRightIcon,
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  TrendingUpIcon,
  WrenchIcon,
} from 'lucide-react'

const transactionEntryCardFragment = graphql`
  fragment transactionEntryCardFragment on TransactionEntry {
    id
    amount
    account {
      name
      currency {
        code
      }
    }
    transaction {
      id
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
  isFirst,
  isLast,
}: {
  fragmentRef: transactionEntryCardFragment$key
  isFirst: boolean
  isLast: boolean
}) {
  const { formatCurrency } = useCurrency()

  const data = useFragment<transactionEntryCardFragment$key>(
    transactionEntryCardFragment,
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
      id={data.id}
      key={data.id}
    >
      <ItemMedia variant="image" className="rounded-full">
        {getCategoryTypeIcon({
          type: data.transaction.category.type,
          icon: data.transaction.category.icon,
        })}
      </ItemMedia>
      <ItemContent className="gap-px">
        <ItemTitle className="">
          <span className="">{data.transaction.category.name}</span>
        </ItemTitle>
        <ItemDescription>
          {format(new Date(data.transaction.datetime), 'LLL d, iiii')}
        </ItemDescription>
      </ItemContent>
      <ItemContent className="items-end gap-px">
        <ItemTitle className="">
          <span className="tabular-nums">
            {formatCurrency({
              value: data.amount,
              currencyCode: data.account.currency.code,
            })}
          </span>
        </ItemTitle>
        <ItemDescription>{data.account.name}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

function getCategoryTypeIcon({
  type,
  icon,
}: {
  type: TransactionCategoryType
  icon: string | null | undefined
}) {
  // If custom icon is provided, use DynamicIcon
  if (icon) {
    return match(type)
      .with('income', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-green-500/90 p-1.5 text-white"
        />
      ))
      .with('expense', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-red-500/90 p-1.5 text-white"
        />
      ))
      .with('transfer', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-orange-500/90 p-1.5 text-white"
        />
      ))
      .with('setup', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-orange-500/90 p-1.5 text-white"
        />
      ))
      .with('investment', () => (
        <DynamicIcon
          name={icon as unknown as IconName}
          className="size-10 bg-blue-500/90 p-1.5 text-white"
        />
      ))
      .otherwise(() => null)
  }

  // Fallback to default icons
  return match(type)
    .with('income', () => (
      <BanknoteArrowUpIcon className="size-10 bg-green-500/90 p-1.5 text-white" />
    ))
    .with('expense', () => (
      <BanknoteArrowDownIcon className="size-10 bg-red-500/90 p-1.5 text-white" />
    ))
    .with('transfer', () => (
      <ArrowLeftRightIcon className="size-10 bg-orange-500/90 p-1.5 text-white" />
    ))
    .with('setup', () => (
      <WrenchIcon className="size-10 bg-orange-500/90 p-1.5 text-white" />
    ))
    .with('investment', () => (
      <TrendingUpIcon className="size-10 bg-blue-500/90 p-1.5 text-white" />
    ))
    .otherwise(() => null)
}
