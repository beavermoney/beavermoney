import { lazy, Suspense, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { Stack } from '@astryxdesign/core/Stack'
import { PendingComponent } from '@/components/pending-component'
import { TransactionActionsTarget } from '@/components/transaction-actions-context'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { useIsMobile } from '@/hooks/use-mobile'

const TransactionEntryContent = lazy(
  () => import('./transaction-entry-content'),
)

export function TransactionEntry() {
  const { t } = useLingui()
  const { type: logTransactionType, close: closeLogTransaction } =
    useLogTransaction()

  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={logTransactionType !== null}
        onOpenChange={(open) => {
          if (!open) closeLogTransaction()
        }}
        label={t`New transaction`}
        height="tall"
        padding={4}
      >
        <Stack gap={4}>
          <DialogHeader
            title={t`New transaction`}
            onOpenChange={(open) => {
              if (!open) closeLogTransaction()
            }}
          />
          {logTransactionType && (
            <Suspense fallback={<PendingComponent />}>
              <TransactionEntryContent />
            </Suspense>
          )}
        </Stack>
      </BottomSheet>
    )
  }

  return (
    <Dialog
      isOpen={logTransactionType !== null}
      onOpenChange={(open) => {
        if (!open) closeLogTransaction()
      }}
      purpose="info"
      width={640}
      maxHeight="calc(100dvh - var(--spacing-4) - var(--spacing-4))"
      padding={0}
    >
      <TransactionActionsTarget value={actionsTarget}>
        <Stack height="min(620px, calc(100dvh - var(--spacing-8)))">
          <Layout
            padding={4}
            footer={
              <LayoutFooter hasDivider padding={4}>
                <Stack ref={setActionsTarget} />
              </LayoutFooter>
            }
            header={
              <DialogHeader
                title={t`New transaction`}
                onOpenChange={(open) => {
                  if (!open) closeLogTransaction()
                }}
              />
            }
          >
            <LayoutContent>
              <Stack direction="vertical" paddingBlockStart={4}>
                {logTransactionType && (
                  <Suspense fallback={<PendingComponent />}>
                    <TransactionEntryContent />
                  </Suspense>
                )}
              </Stack>
            </LayoutContent>
          </Layout>
        </Stack>
      </TransactionActionsTarget>
    </Dialog>
  )
}
