import { Card } from '@astryxdesign/core/Card'
import { TransactionDaySummary } from './transaction-day-summary'
import { Divider } from '@astryxdesign/core/Divider'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import { ReceiptText } from 'lucide-react'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { graphql } from 'relay-runtime'

import { ErrorBoundary } from '@sentry/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useInView } from 'react-intersection-observer'
import type { PreloadedQuery } from 'react-relay'
import { usePaginationFragment, useQueryLoader } from 'react-relay'
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
          ...transactionDaySummaryFragment
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
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
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
  const loadMore = useCallback(() => {
    if (isLoadingNext || !hasNext) return
    loadNext(isMobile ? 20 : 50, {
      onComplete: (error) => {
        setLoadError(error ? 'Could not load more transactions.' : null)
      },
    })
  }, [loadNext, isMobile, isLoadingNext, hasNext])

  useRegisterConnection(data.transactions.__id, NodeType.Transaction)

  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView && !loadError) {
      loadMore()
    }
  }, [inView, loadError, loadMore])

  const transactions =
    data.transactions.edges?.flatMap((edge) =>
      edge?.node ? [edge.node] : [],
    ) ?? []
  const groups: { date: Date; transactions: typeof transactions }[] = []
  {
    for (const transaction of transactions) {
      const date = startOfDay(parseISO(transaction.datetime))
      const last = groups[groups.length - 1]
      if (last && isSameDay(last.date, date))
        last.transactions.push(transaction)
      else groups.push({ date, transactions: [transaction] })
    }
  }

  const list =
    transactions.length === 0 && !hasNext && !loadError ? (
      <EmptyState
        icon={<Icon icon={ReceiptText} />}
        title="No transactions found"
        description="No transactions match your current filters. Try another date range or adjust your filters."
        headingLevel={2}
      />
    ) : (
      <ScrollableArea label="Scrollable content">
        <Stack direction="vertical" gap={4}>
          {groups.map((group, groupIndex) => (
            <Card key={group.date.toISOString()} padding={0}>
              <Stack
                direction="horizontal"
                gap={3}
                align="center"
                justify="between"
                padding={3}
              >
                <Text weight="semibold" textWrap="nowrap">
                  {formatDateHeader(group.date)}
                </Text>
                <TransactionDaySummary
                  fragmentRef={group.transactions}
                  isPartial={hasNext && groupIndex === groups.length - 1}
                />
              </Stack>
              <Divider />
              <Stack direction="vertical" gap={0}>
                {group.transactions.map((transaction, index) => (
                  <Fragment key={transaction.id}>
                    {index > 0 && <Divider />}
                    <TransactionCard
                      fragmentRef={transaction}
                      onPreload={preloadTransaction}
                    />
                  </Fragment>
                ))}
              </Stack>
            </Card>
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
  const mobile = useIsMobile()
  const [editingPending, setEditingPending] = useState(false)
  const Surface = mobile ? BottomSheet : Dialog
  const matchingQueryRef =
    retainedTransactionId === queryRef?.variables.transactionId
      ? queryRef
      : null

  return (
    <>
      <Surface
        className={mobile ? 'transaction-composer-sheet' : undefined}
        label="Edit transaction"
        {...(mobile ? { height: 'hug' as const } : {})}
        isOpen={transactionId !== null}
        onOpenChange={(open) => {
          if (!open && !editingPending) {
            onClose()
            onCloseComplete()
          }
        }}
        purpose={editingPending ? 'required' : 'info'}
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
                onPendingChange={setEditingPending}
              />
            </Suspense>
          ) : (
            <TransactionDialogPreview
              fragmentRef={previewRef}
              onClose={onClose}
            />
          )}
        </ErrorBoundary>
      </Surface>
    </>
  )
}

function formatDateHeader(date: Date): string {
  const today = startOfToday()
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, subDays(today, 1))) return 'Yesterday'
  return format(date, 'MMMM d')
}
