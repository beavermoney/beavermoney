import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useCallback } from 'react'
import { useIsMobile } from './use-mobile'
import {
  logTransactionStore,
  setLogTransactionType,
  type LogTransactionType,
} from './log-transaction-store'

export function useLogTransaction() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const type = useStore(logTransactionStore, (s) => s.type)

  const open = useCallback(
    (nextType: LogTransactionType = 'expense') => {
      setLogTransactionType(nextType)
      if (isMobile) {
        navigate({
          from: '/household/$householdId/',
          to: '/household/$householdId/transactions/new',
        })
      }
    },
    [isMobile, navigate],
  )

  const close = useCallback(() => {
    setLogTransactionType(null)
    if (isMobile) {
      navigate({ to: '..' })
    }
  }, [isMobile, navigate])

  return {
    type,
    isOpen: type !== null,
    open,
    close,
    setType: setLogTransactionType,
  }
}
