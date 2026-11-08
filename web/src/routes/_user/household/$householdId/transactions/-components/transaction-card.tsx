import { Divider } from '@astryxdesign/core/Divider'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import { graphql } from 'relay-runtime'
import { match } from 'ts-pattern'
import type { transactionCardFragment$key } from './__generated__/transactionCardFragment.graphql'

import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { InvestmentLotCard } from './investment-lot-card'
import { TransactionEntryCard } from './transaction-entry-card'

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
  onPreload: (transactionId: string) => void
}

export function TransactionCard({
  fragmentRef,
  onPreload,
}: TransactionCardProps) {
  const data = useFragment(transactionCardFragment, fragmentRef)

  const categoryName = data.category.name

  const sortedItems = useMemo(() => {
    invariant(data.transactionEntries, 'Transaction entries should be defined')
    const entries = data.transactionEntries.map((entry) => ({
      type: 'entry' as const,
      entry,
    }))
    invariant(data.investmentLots, 'Investment lots should be defined')
    const lots = data.investmentLots.map((lot) => ({
      type: 'lot' as const,
      lot,
    }))
    return match(categoryName)
      .with('Buy', () => {
        const negativeEntries = entries.filter(
          (item) => currency(item.entry.amount, { precision: 8 }).value < 0,
        )
        const positiveLots = lots.filter(
          (item) => currency(item.lot.amount, { precision: 8 }).value > 0,
        )
        return [...positiveLots, ...negativeEntries]
      })
      .with('Sell', () => {
        const negativeLots = lots.filter(
          (item) => currency(item.lot.amount, { precision: 8 }).value < 0,
        )
        const positiveEntries = entries.filter(
          (item) => currency(item.entry.amount, { precision: 8 }).value > 0,
        )
        return [...negativeLots, ...positiveEntries]
      })
      .otherwise(() => {
        const debits = [...lots, ...entries].filter((item) => {
          const amount =
            item.type === 'lot' ? item.lot.amount : item.entry.amount
          return currency(amount, { precision: 8 }).value < 0
        })
        const credits = [...lots, ...entries].filter((item) => {
          const amount =
            item.type === 'lot' ? item.lot.amount : item.entry.amount
          return currency(amount, { precision: 8 }).value >= 0
        })
        return [...debits, ...credits]
      })
  }, [data, categoryName])

  return (
    <Link
      to="."
      resetScroll={false}
      search={(search) => ({ ...search, edit_transaction_id: data.id })}
      onPointerEnter={() => onPreload(data.id)}
      onFocus={() => onPreload(data.id)}
      onClick={() => onPreload(data.id)}
    >
      {sortedItems.map((item, index) =>
        item.type === 'lot' ? (
          <Fragment key={item.lot.id}>
            {index !== 0 && <Divider />}
            <InvestmentLotCard
              fragmentRef={item.lot}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
            />
          </Fragment>
        ) : (
          <Fragment key={item.entry.id}>
            {index !== 0 && <Divider />}
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
