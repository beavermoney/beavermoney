import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useCallback } from 'react'
import {
  logTransactionStore,
  setLogTransactionDefaults,
  setLogTransactionType,
  type LogTransactionDefaults,
  type LogTransactionType,
} from './log-transaction-store'

export function useLogTransaction() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const type = useStore(logTransactionStore, (s) => s.type)
  const defaults = useStore(logTransactionStore, (s) => s.defaults)

  const open = useCallback(
    (
      nextType: LogTransactionType = 'expense',
      nextDefaults?: LogTransactionDefaults,
    ) => {
      logTransactionStore.setState(() => ({
        type: nextType,
        defaults: nextDefaults,
      }))
    },
    [],
  )

  const close = useCallback(() => {
    logTransactionStore.setState(() => ({ type: null }))
    if (pathname.endsWith('/transactions/new')) {
      navigate({ to: '..', search: (prev) => prev, resetScroll: false })
    }
  }, [pathname, navigate])

  return {
    type,
    defaults,
    isOpen: type !== null,
    open,
    close,
    setType: setLogTransactionType,
    setDefaults: setLogTransactionDefaults,
  }
}
