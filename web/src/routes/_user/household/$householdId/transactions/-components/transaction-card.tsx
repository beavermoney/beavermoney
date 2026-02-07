import { graphql } from 'relay-runtime'
import { match } from 'ts-pattern'
import { useFragment } from 'react-relay'
import currency from 'currency.js'
import type {
  transactionCardFragment$data,
  transactionCardFragment$key,
} from './__generated__/transactionCardFragment.graphql'
import { Fragment } from 'react/jsx-runtime'
import { Separator } from '@/components/ui/separator'
import { InvestmentLotCard } from './investment-lot-card'
import { TransactionEntryCard } from './transaction-entry-card'
import { Link } from '@tanstack/react-router'

const transactionCardFragment = graphql`
  fragment transactionCardFragment on Transaction {
    id
    transactionEntries {
      id
      amount
      ...transactionEntryCardFragment
    }
    investmentLots {
      id
      amount
      ...investmentLotCardFragment
    }
    category {
      name
    }
  }
`

type TransactionCardProps = {
  fragmentRef: transactionCardFragment$key
}

export function TransactionCard({ fragmentRef }: TransactionCardProps) {
  const data = useFragment(transactionCardFragment, fragmentRef)

  // Sort entries based on category type
  const sortedItems = getSortedTransactionItems(data)

  return (
    <Link
      to="."
      search={(search) => ({ ...search, edit_transaction_id: data.id })}
      className="border-border [a]:hover:bg-muted group/item focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-wrap items-center rounded-md border text-xs/relaxed transition-colors duration-100 outline-none focus-visible:ring-[3px] [a]:transition-colors"
    >
      {sortedItems.map((item, index) =>
        item.type === 'lot' ? (
          <Fragment key={item.lot.id}>
            {index !== 0 && <Separator className="" />}
            <InvestmentLotCard
              fragmentRef={item.lot}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
            />
          </Fragment>
        ) : (
          <Fragment key={item.entry.id}>
            {index !== 0 && <Separator className="" />}
            <TransactionEntryCard
              fragmentRef={item.entry}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
            />
          </Fragment>
        ),
      )}
    </Link>
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
