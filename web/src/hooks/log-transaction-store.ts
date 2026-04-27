import { createStore } from '@tanstack/store'

export type LogTransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'buy'
  | 'sell'
  | 'move'

export type LogTransactionDefaults = {
  accountId?: string
}

type LogTransactionState = {
  type: LogTransactionType | null
  defaults?: LogTransactionDefaults
}

export const logTransactionStore = createStore<LogTransactionState>({
  type: null,
})

export function setLogTransactionType(type: LogTransactionType | null) {
  logTransactionStore.setState((prev) => ({ ...prev, type }))
}

export function setLogTransactionDefaults(
  defaults: LogTransactionDefaults | undefined,
) {
  logTransactionStore.setState((prev) => ({ ...prev, defaults }))
}
