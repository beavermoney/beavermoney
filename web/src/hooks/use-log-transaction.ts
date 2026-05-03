import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useCallback } from 'react'
import { useIsMobile } from './use-mobile'
import {
  logTransactionStore,
  setLogTransactionDefaults,
  setLogTransactionType,
  type LogTransactionDefaults,
  type LogTransactionType,
} from './log-transaction-store'

export function useLogTransaction() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

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
      if (isMobile) {
        navigate({
          from: '/household/$householdId/{-$viewUserId}',
          to: '/household/$householdId/{-$viewUserId}/transactions/new',
        })
      }
    },
    [isMobile, navigate],
  )

  const close = useCallback(() => {
    logTransactionStore.setState(() => ({ type: null }))
    if (isMobile) {
      navigate({ to: '..' })
    }
  }, [isMobile, navigate])

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
