import { graphql } from 'relay-runtime'
import { match } from 'ts-pattern'
import { useFragment } from 'react-relay'
import {
  ArrowLeftRightIcon,
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  TrendingUpIcon,
  WrenchIcon,
} from 'lucide-react'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import currency from 'currency.js'
import { useState } from 'react'
import type {
  TransactionCategoryType,
  transactionCardFragment$data,
  transactionCardFragment$key,
} from './__generated__/transactionCardFragment.graphql'
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
import { Fragment } from 'react/jsx-runtime'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { editTransactionDialogCategoriesFragment$key } from './__generated__/editTransactionDialogCategoriesFragment.graphql'

const transactionCardFragment = graphql`
  fragment transactionCardFragment on Transaction {
    id
    datetime
    category {
      name
      type
      icon
    }
    investmentLots {
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
    }
    transactionEntries {
      id
      amount
      account {
        name
        currency {
          code
        }
      }
    }
    ...editTransactionDialogFragment
  }
`

type TransactionCardProps = {
  fragmentRef: transactionCardFragment$key
  categoriesRef: editTransactionDialogCategoriesFragment$key
}

export function TransactionCard({
  fragmentRef,
  categoriesRef,
}: TransactionCardProps) {
  const data = useFragment(transactionCardFragment, fragmentRef)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Sort entries based on category type
  const sortedItems = getSortedTransactionItems(data)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="border-border hover:bg-muted group/item focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-wrap items-center rounded-md border text-xs/relaxed transition-colors duration-100 outline-none focus-visible:ring-[3px]"
          />
        }
      >
        {sortedItems.map((item, index) =>
          item.type === 'lot' ? (
            <Fragment key={item.lot.id}>
              {index !== 0 && <Separator className="" />}
              <InvestmentLotCard
                data={data}
                investmentLot={item.lot}
                isFirst={index === 0}
                isLast={index === sortedItems.length - 1}
              />
            </Fragment>
          ) : (
            <Fragment key={item.entry.id}>
              {index !== 0 && <Separator className="" />}
              <TransactionEntryCard
                data={data}
                transactionEntry={item.entry}
                isFirst={index === 0}
                isLast={index === sortedItems.length - 1}
              />
            </Fragment>
          ),
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <EditTransactionDialog
          fragmentRef={data}
          categoriesRef={categoriesRef}
          onOpenChange={setDialogOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

type SortedItem =
  | {
      type: 'lot'
      lot: NonNullable<transactionCardFragment$data['investmentLots']>[number]
    }
  | {
      type: 'entry'
      entry: NonNullable<
        transactionCardFragment$data['transactionEntries']
      >[number]
    }

function getSortedTransactionItems(
  data: transactionCardFragment$data,
): SortedItem[] {
  const lots: SortedItem[] =
    data.investmentLots?.map((lot) => ({ type: 'lot' as const, lot })) ?? []
  const entries: SortedItem[] =
    data.transactionEntries?.map((entry) => ({
      type: 'entry' as const,
      entry,
    })) ?? []

  const categoryName = data.category.name

  return match(categoryName)
    .with('Buy', () => {
      const negativeEntries = entries.filter(
        (item) =>
          item.type === 'entry' && currency(item.entry.amount).value < 0,
      )
      const positiveLots = lots.filter(
        (item) => item.type === 'lot' && currency(item.lot.amount).value > 0,
      )
      return [...positiveLots, ...negativeEntries]
    })
    .with('Sell', () => {
      const negativeLots = lots.filter(
        (item) => item.type === 'lot' && currency(item.lot.amount).value < 0,
      )
      const positiveEntries = entries.filter(
        (item) =>
          item.type === 'entry' && currency(item.entry.amount).value > 0,
      )
      return [...negativeLots, ...positiveEntries]
    })
    .otherwise(() => {
      const debits = [...lots, ...entries].filter((item) => {
        const amount = item.type === 'lot' ? item.lot.amount : item.entry.amount
        return currency(amount).value < 0
      })
      const credits = [...lots, ...entries].filter((item) => {
        const amount = item.type === 'lot' ? item.lot.amount : item.entry.amount
        return currency(amount).value >= 0
      })
      return [...debits, ...credits]
    })
}

function TransactionEntryCard({
  data,
  transactionEntry,
  isFirst,
  isLast,
}: {
  data: transactionCardFragment$data
  transactionEntry: NonNullable<
    transactionCardFragment$data['transactionEntries']
  >[number]
  isFirst: boolean
  isLast: boolean
}) {
  const { formatCurrency } = useCurrency()

  return (
    <Item
      variant="default"
      role="listitem"
      className={cn(
        !isFirst && 'rounded-t-none border-t-0',
        !isLast && 'rounded-b-none',
      )}
    >
      <ItemMedia variant="image" className="rounded-full">
        {getCategoryTypeIcon({
          type: data.category.type,
          icon: data.category.icon,
        })}
      </ItemMedia>
      <ItemContent className="gap-px">
        <ItemTitle className="">
          <span className="">{data.category.name}</span>
        </ItemTitle>
        <ItemDescription>
          {format(new Date(data.datetime), 'LLL d, iiii')}
        </ItemDescription>
      </ItemContent>
      <ItemContent className="items-end gap-px">
        <ItemTitle className="">
          <span className="tabular-nums">
            {formatCurrency({
              value: transactionEntry.amount,
              currencyCode: transactionEntry.account.currency.code,
            })}
          </span>
        </ItemTitle>
        <ItemDescription>{transactionEntry.account.name}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

function InvestmentLotCard({
  data,
  investmentLot,
  isFirst,
  isLast,
}: {
  data: transactionCardFragment$data
  investmentLot: NonNullable<
    transactionCardFragment$data['investmentLots']
  >[number]
  isFirst: boolean
  isLast: boolean
}) {
  const { formatCurrency } = useCurrency()

  return (
    <Item
      variant="default"
      role="listitem"
      className={cn(
        !isFirst && 'rounded-t-none border-t-0',
        !isLast && 'rounded-b-none',
      )}
    >
      <ItemMedia variant="image">
        <Avatar>
          <AvatarImage
            src={getLogoTickerURL(investmentLot.investment.symbol || '')}
            alt={investmentLot.investment.symbol || 'unknown logo'}
          />
          <AvatarFallback>{investmentLot.investment.symbol}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className="gap-px">
        <ItemTitle className="">
          <span>{data.category.name}</span>
        </ItemTitle>
        <ItemDescription>
          {format(new Date(data.datetime), 'LLL d, iiii')}
        </ItemDescription>
      </ItemContent>
      <ItemContent className="items-end gap-px">
        <ItemTitle className="">
          <span className="tabular-nums">
            {formatCurrency({
              value: currency(investmentLot.price).multiply(
                currency(investmentLot.amount),
              ),
              currencyCode: investmentLot.investment.currency.code,
            })}
          </span>
        </ItemTitle>
        <ItemDescription>
          {investmentLot.amount} {investmentLot.investment.name} @{' '}
          {formatCurrency({
            value: currency(investmentLot.price),
            currencyCode: investmentLot.investment.currency.code,
          })}
        </ItemDescription>
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
