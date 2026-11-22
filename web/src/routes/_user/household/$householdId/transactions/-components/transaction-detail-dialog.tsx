import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Suspense, useState } from 'react'
import { useLazyLoadQuery, type PreloadedQuery } from 'react-relay'
import { ErrorBoundary } from '@sentry/react'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { PageProgress } from '@/components/page-progress'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  EditTransactionDialog,
  LazyEditTransactionDialog,
  EditTransactionDialogQuery,
} from './edit-transaction-dialog'
import type { editTransactionDialogQuery } from './__generated__/editTransactionDialogQuery.graphql'

type TransactionDetailDialogProps = {
  viewUserIds: readonly string[] | null
  transactionId: string | null
  retainedTransactionId: string | null
  queryRef: PreloadedQuery<editTransactionDialogQuery> | null | undefined
  onClose: () => void
  onCloseComplete: () => void
}

export function TransactionDetailDialog(props: TransactionDetailDialogProps) {
  const { t } = useLingui()
  const [openId, setOpenId] = useState(props.transactionId)
  const [revision, setRevision] = useState(0)
  if (openId !== props.transactionId) {
    setOpenId(props.transactionId)
    if (props.transactionId !== null) setRevision((value) => value + 1)
  }
  if (!props.retainedTransactionId) return null
  return (
    <Suspense
      fallback={
        props.transactionId ? <PageProgress label={t`Loading content`} /> : null
      }
    >
      <ErrorBoundary
        key={`${props.retainedTransactionId}:${revision}`}
        fallback={
          <Dialog
            isOpen={props.transactionId !== null}
            onOpenChange={(open) => {
              if (!open) props.onClose()
            }}
          >
            <DialogHeader
              title={t`Could not load transaction`}
              onOpenChange={() => props.onClose()}
            />
            <Text>{t`Close the dialog and try opening the transaction again.`}</Text>
            <Button label={t`Close`} onClick={props.onClose} />
          </Dialog>
        }
      >
        <TransactionDetailDialogReady key={revision} {...props} />
      </ErrorBoundary>
    </Suspense>
  )
}

function TransactionDetailDialogReady({
  viewUserIds,
  transactionId,
  retainedTransactionId,
  queryRef,
  onClose,
  onCloseComplete,
}: TransactionDetailDialogProps) {
  // Read before mounting the portal: a guessed preview would resize when the
  // real transaction type, split count and mobile editor become available.
  useLazyLoadQuery<editTransactionDialogQuery>(EditTransactionDialogQuery, {
    transactionId: retainedTransactionId!,
    viewUserIds,
  })
  const { t } = useLingui()
  const mobile = useIsMobile()
  const [editingPending, setEditingPending] = useState(false)
  const Surface = mobile ? BottomSheet : Dialog
  const matchingQueryRef =
    retainedTransactionId === queryRef?.variables.transactionId &&
    JSON.stringify(viewUserIds) ===
      JSON.stringify(queryRef.variables.viewUserIds ?? null)
      ? queryRef
      : null

  return (
    <>
      <Surface
        label={t`Edit transaction`}
        {...(mobile
          ? { height: 'hug' as const }
          : {
              width: 640,
              maxHeight: 'calc(100dvh - var(--spacing-4) - var(--spacing-4))',
            })}
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
                  title={t`Could not load transaction`}
                  onOpenChange={(open) => {
                    if (!open) onClose()
                  }}
                />
              }
            >
              <LayoutContent>
                <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                  <Text type="supporting">
                    <Trans>
                      Close the dialog and try opening the transaction again.
                    </Trans>
                  </Text>
                  <Stack direction="horizontal" justify="end">
                    <Button
                      onClick={onClose}
                      label={t`Close`}
                      variant="secondary"
                    />
                  </Stack>
                </Stack>
              </LayoutContent>
            </Layout>
          }
        >
          {matchingQueryRef ? (
            <EditTransactionDialog
              key={retainedTransactionId}
              queryRef={matchingQueryRef}
              onClose={onClose}
              onPendingChange={setEditingPending}
            />
          ) : (
            <LazyEditTransactionDialog
              key={`${retainedTransactionId}:${viewUserIds?.join(',') ?? 'all'}`}
              transactionId={retainedTransactionId!}
              viewUserIds={viewUserIds}
              onClose={onClose}
              onPendingChange={setEditingPending}
            />
          )}
        </ErrorBoundary>
      </Surface>
    </>
  )
}
