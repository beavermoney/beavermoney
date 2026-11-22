import { presentedLocation } from '@/lib/presented-location'
import { useBackNavigation } from './use-back-navigation'
import { useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useCallback } from 'react'
import {
  logTransactionStore,
  deliverTransactionDefaults,
  setLogTransactionDefaults,
  setLogTransactionType,
  type LogTransactionDefaults,
  type LogTransactionType,
} from './log-transaction-store'

export function useLogTransaction() {
  const goBack = useBackNavigation()
  const pathname = useRouterState({
    select: (state) => presentedLocation(state).pathname,
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
      deliverTransactionDefaults(nextType, nextDefaults)
    },
    [],
  )

  const close = useCallback(() => {
    logTransactionStore.setState(() => ({ type: null }))
    if (pathname.endsWith('/transactions/new')) {
      goBack({ to: '..', search: (prev) => prev, resetScroll: false })
    }
  }, [pathname, goBack])

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
