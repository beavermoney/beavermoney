import { useState } from 'react'
import { useTransactionEntryData } from './use-transaction-entry-data'
import { useLingui } from '@lingui/react/macro'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { Stack } from '@astryxdesign/core/Stack'
import { TransactionActionsTarget } from '@/components/transaction-actions-context'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { useIsMobile } from '@/hooks/use-mobile'

import TransactionEntryContent from './transaction-entry-content'

export default function TransactionEntrySurface() {
  useTransactionEntryData()
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
          {logTransactionType && <TransactionEntryContent />}
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
                <Stack ref={setActionsTarget} minHeight="var(--spacing-8)" />
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
                {logTransactionType && <TransactionEntryContent />}
              </Stack>
            </LayoutContent>
          </Layout>
        </Stack>
      </TransactionActionsTarget>
    </Dialog>
  )
}
