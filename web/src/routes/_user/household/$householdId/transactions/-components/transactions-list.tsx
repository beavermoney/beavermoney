import { graphql } from 'relay-runtime'

import { usePaginationFragment } from 'react-relay'
import { useInView } from 'react-intersection-observer'
import { Fragment } from 'react/jsx-runtime'
import { useEffect } from 'react'
import { TransactionCard } from './transaction-card'
import type { transactionsListFragment$key } from './__generated__/transactionsListFragment.graphql'
import { ItemGroup } from '@/components/ui/item'

const transactionsListFragment = graphql`
  fragment transactionsListFragment on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 20 }
    cursor: { type: "Cursor" }
    where: { type: "TransactionWhereInput" }
  )
  @refetchable(queryName: "transactionsListRefetch") {
    transactions(
      first: $count
      after: $cursor
      where: $where
      orderBy: { field: DATETIME, direction: DESC }
    ) @connection(key: "transactionsList_transactions") {
      edges {
        node {
          id
          ...transactionCardFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    ...editTransactionDialogCategoriesFragment
  }
`

type TransactionsListProps = {
  fragmentRef: transactionsListFragment$key
}

export function TransactionsList({ fragmentRef }: TransactionsListProps) {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    transactionsListFragment,
    fragmentRef,
  )

  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView && hasNext && !isLoadingNext) {
      loadNext(20)
    }
  }, [inView, hasNext, isLoadingNext, loadNext])

  return (
    <Fragment>
      <ItemGroup>
        {data.transactions.edges?.map((transaction) => {
          if (!transaction?.node) {
            return null
          }

          return (
            <Fragment key={transaction.node.id}>
              <TransactionCard
                fragmentRef={transaction.node}
                categoriesRef={data}
              />
            </Fragment>
          )
        })}
      </ItemGroup>
      <div ref={ref}></div>
    </Fragment>
  )
}
