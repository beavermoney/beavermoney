import { useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { TransactionActionsTarget } from './transaction-actions-context'

export function TransactionFormActions({ children }: { children: ReactNode }) {
  const target = useContext(TransactionActionsTarget)
  return target ? createPortal(children, target) : children
}
