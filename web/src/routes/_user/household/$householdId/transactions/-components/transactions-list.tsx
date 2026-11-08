import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { graphql } from 'relay-runtime'
import { TransactionsTable } from './transactions-table'

import { ErrorBoundary } from '@sentry/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useInView } from 'react-intersection-observer'
import type { PreloadedQuery } from 'react-relay'
import {
  usePaginationFragment,
  useQueryLoader,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import type { editTransactionDialogQuery } from './__generated__/editTransactionDialogQuery.graphql'
import type { transactionsListFragment$key } from './__generated__/transactionsListFragment.graphql'
import type { transactionsListRefetch } from './__generated__/transactionsListRefetch.graphql'
import { TransactionCard } from './transaction-card'

import { NodeType, useRegisterConnection } from '@/lib/relay'

import {
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfToday,
  subDays,
} from 'date-fns'
import {
  EditTransactionDialog,
  EditTransactionDialogQuery,
} from './edit-transaction-dialog'

import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import type { transactionDialogPreviewFragment$key } from './__generated__/transactionDialogPreviewFragment.graphql'
import { TransactionDialogPreview } from './transaction-dialog-preview'

const transactionsListFragment = graphql`
  fragment transactionsListFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 20 }
    cursor: { type: "Cursor" }
    where: { type: "TransactionWhereInput" }
    orderBy: {
      type: "TransactionOrder"
      defaultValue: { field: DATETIME, direction: DESC }
    }
  )
  @refetchable(queryName: "transactionsListRefetch") {
    id
    transactions(
      first: $count
      after: $cursor
      where: $where
      orderBy: $orderBy
    ) @connection(key: "transactionsList_transactions") {
      __id
      edges {
        node {
          id
          datetime
          ...transactionCardFragment
          ...transactionDialogPreviewFragment
          ...transactionsTableFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

type TransactionsListProps = {
  fragmentRef: transactionsListFragment$key
}

export function TransactionsList({ fragmentRef }: TransactionsListProps) {
  const showToast = useToast()

  const { data, loadNext, hasNext, isLoadingNext, refetch } =
    usePaginationFragment<
      transactionsListRefetch,
      transactionsListFragment$key
    >(transactionsListFragment, fragmentRef)

  const isMobile = useIsMobile()
  const editTransactionId = useSearch({
    from: '/_user/household/$householdId',
    select: (search) => search.edit_transaction_id,
  })
  const navigate = useNavigate()
  const { viewUserIds } = useHouseholdViewScope()
  const [editQueryRef, loadEditQuery, disposeEditQuery] =
    useQueryLoader<editTransactionDialogQuery>(EditTransactionDialogQuery)
  const loadedEditKeyRef = useRef<string | null>(null)
  const [retainedTransactionId, setRetainedTransactionId] = useState<
    string | null
  >(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [isSorting, startTransition] = useTransition()
  const preloadTransaction = useCallback(
    (transactionId: string) => {
      const scopeKey = viewUserIds?.join(',') ?? 'all'
      const editKey = `${transactionId}:${scopeKey}`
      if (loadedEditKeyRef.current === editKey) return

      loadedEditKeyRef.current = editKey
      setRetainedTransactionId(transactionId)
      loadEditQuery(
        { transactionId, viewUserIds },
        { fetchPolicy: 'store-or-network' },
      )
    },
    [loadEditQuery, viewUserIds],
  )
  const openTransaction = useCallback(
    (transactionId: string) => {
      preloadTransaction(transactionId)
      navigate({
        to: '.',
        resetScroll: false,
        search: (previous) => ({
          ...previous,
          edit_transaction_id: transactionId,
        }),
      })
    },
    [navigate, preloadTransaction],
  )
  useEffect(() => {
    if (editTransactionId) {
      preloadTransaction(editTransactionId)
    }
  }, [editTransactionId, preloadTransaction])

  const finishClosingTransaction = useCallback(() => {
    if (editTransactionId) return
    loadedEditKeyRef.current = null
    setRetainedTransactionId(null)
    disposeEditQuery()
  }, [disposeEditQuery, editTransactionId])
  const changeSort = useCallback(
    (nextDirection: 'ASC' | 'DESC') => {
      startTransition(() => {
        refetch(
          {
            orderBy: { field: 'DATETIME', direction: nextDirection },
            cursor: null,
            count: 20,
          },
          {
            fetchPolicy: 'store-and-network',
            onComplete: (error) => {
              if (error)
                showToast({
                  type: 'error',
                  body: 'Could not sort transactions. Please try again.',
                })
              else setLoadError(null)
            },
          },
        )
        setDirection(nextDirection)
      })
    },
    [refetch, showToast],
  )
  useEffect(() => {
    if (isMobile && direction !== 'DESC' && !isSorting) changeSort('DESC')
  }, [isMobile, direction, isSorting, changeSort])

  // Page-level invalidation refreshes DESC. Refresh the active ASC connection too.
  useSubscribeToInvalidationState([data.id], () => {
    if (direction !== 'ASC') return
    startTransition(() => {
      refetch(
        {
          cursor: null,
          count: Math.max(20, data.transactions.edges?.length ?? 0),
        },
        { fetchPolicy: 'network-only' },
      )
    })
  })

  const loadMore = useCallback(() => {
    if (isLoadingNext || isSorting || !hasNext) return
    loadNext(isMobile ? 20 : 50, {
      onComplete: (error) => {
        setLoadError(error ? 'Could not load more transactions.' : null)
      },
    })
  }, [loadNext, isMobile, isLoadingNext, isSorting, hasNext])

  useRegisterConnection(data.transactions.__id, NodeType.Transaction)

  const [ref, inView] = useInView()

  useEffect(() => {
    if (isMobile && inView && !loadError) {
      loadMore()
    }
  }, [isMobile, inView, loadError, loadMore])

  const transactions =
    data.transactions.edges?.flatMap((edge) =>
      edge?.node ? [edge.node] : [],
    ) ?? []
  const groups: { date: Date; transactions: typeof transactions }[] = []
  if (isMobile) {
    for (const transaction of transactions) {
      const date = startOfDay(parseISO(transaction.datetime))
      const last = groups[groups.length - 1]
      if (last && isSameDay(last.date, date))
        last.transactions.push(transaction)
      else groups.push({ date, transactions: [transaction] })
    }
  }

  const list = !isMobile ? (
    <TransactionsTable
      fragmentRef={transactions}
      direction={direction}
      onToggleSort={() => changeSort(direction === 'DESC' ? 'ASC' : 'DESC')}
      isSorting={isSorting}
      hasNext={hasNext}
      isLoadingNext={isLoadingNext}
      onLoadMore={loadMore}
      loadError={loadError}
      onOpenTransaction={openTransaction}
      onPreloadTransaction={preloadTransaction}
    />
  ) : (
    <ScrollableArea label="Scrollable content">
      <Stack direction="vertical" gap={4}>
        {groups.map((group) => (
          <Fragment key={group.date.toISOString()}>
            <Text as="div" display="block" type="supporting">
              {formatDateHeader(group.date)}
            </Text>
            <Stack direction="vertical" gap={2}>
              {group.transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  fragmentRef={transaction}
                  onPreload={preloadTransaction}
                />
              ))}
            </Stack>
          </Fragment>
        ))}
        {loadError && (
          <Stack
            direction="horizontal"
            gap={2}
            align="center"
            justify="center"
            role="alert"
          >
            {loadError}
            <Button
              onClick={loadMore}
              label={'Retry'}
              variant={'secondary'}

              isDisabled={isLoadingNext}
            >
              Retry
            </Button>
          </Stack>
        )}
        <div ref={ref}></div>
      </Stack>
    </ScrollableArea>
  )

  return (
    <>
      {list}
      <TransactionDetailDialog
        transactionId={editTransactionId}
        retainedTransactionId={editTransactionId ?? retainedTransactionId}
        queryRef={editQueryRef}
        previewRef={
          transactions.find(
            (transaction) =>
              transaction.id === (editTransactionId ?? retainedTransactionId),
          ) ?? null
        }
        onClose={() => {
          navigate({
            to: '.',
            resetScroll: false,
            search: (previous) => ({
              ...previous,
              edit_transaction_id: null,
            }),
          })
        }}
        onCloseComplete={finishClosingTransaction}
      />
    </>
  )
}

type TransactionDetailDialogProps = {
  transactionId: string | null
  retainedTransactionId: string | null
  queryRef: PreloadedQuery<editTransactionDialogQuery> | null | undefined
  previewRef: transactionDialogPreviewFragment$key | null
  onClose: () => void
  onCloseComplete: () => void
}

function TransactionDetailDialog({
  transactionId,
  retainedTransactionId,
  queryRef,
  previewRef,
  onClose,
  onCloseComplete,
}: TransactionDetailDialogProps) {
  const matchingQueryRef =
    retainedTransactionId === queryRef?.variables.transactionId
      ? queryRef
      : null

  return (
    <>
      <Dialog
        isOpen={transactionId !== null}
        onOpenChange={(open) => {
          if (!open) {
            onClose()
            onCloseComplete()
          }
        }}
        purpose="info"
        padding={0}
      >
        <ErrorBoundary
          key={retainedTransactionId ?? 'closed'}
          fallback={
            <Layout
              padding={6}
              header={
                <DialogHeader
                  title="Could not load transaction"
                  onOpenChange={(open) => {
                    if (!open) onClose()
                  }}
                />
              }
            >
              <LayoutContent>
                <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                  <Text type="supporting">
                    Close the dialog and try opening the transaction again.
                  </Text>
                  <Stack direction="horizontal" justify="end">
                    <Button
                      onClick={onClose}
                      label="Close"
                      variant="secondary"
                    />
                  </Stack>
                </Stack>
              </LayoutContent>
            </Layout>
          }
        >
          {matchingQueryRef && transactionId !== null ? (
            <Suspense
              fallback={
                <TransactionDialogPreview
                  fragmentRef={previewRef}
                  onClose={onClose}
                />
              }
            >
              <EditTransactionDialog
                key={retainedTransactionId}
                queryRef={matchingQueryRef}
                onClose={onClose}
              />
            </Suspense>
          ) : (
            <TransactionDialogPreview
              fragmentRef={previewRef}
              onClose={onClose}
            />
          )}
        </ErrorBoundary>
      </Dialog>
    </>
  )
}

function formatDateHeader(date: Date): string {
  const today = startOfToday()
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, subDays(today, 1))) return 'Yesterday'
  return format(date, 'MMMM d')
}
