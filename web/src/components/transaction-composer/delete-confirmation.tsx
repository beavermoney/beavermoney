import { AlertDialog } from '@astryxdesign/core/AlertDialog'
import { useState } from 'react'

export function TransactionDeleteConfirmation({
  isOpen,
  onOpenChange,
  pending,
  onDelete,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  pending: boolean
  onDelete: () => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const busy = pending || submitting
  return (
    <AlertDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!busy) {
          setError('')
          onOpenChange(open)
        }
      }}
      title="Delete transaction?"
      description={
        error ||
        'This will permanently remove this transaction and its entries. You can’t undo this.'
      }
      actionLabel="Delete transaction"
      isActionLoading={busy}
      onAction={async () => {
        if (busy) return
        setSubmitting(true)
        setError('')
        try {
          await onDelete()
        } catch {
          setError('Could not delete this transaction. Please try again.')
        } finally {
          setSubmitting(false)
        }
      }}
    />
  )
}
