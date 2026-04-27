import { createStore } from '@tanstack/store'

export type LogTransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'buy'
  | 'sell'
  | 'move'

type LogTransactionState = {
  type: LogTransactionType | null
}

export const logTransactionStore = createStore<LogTransactionState>({
  type: null,
})

export function setLogTransactionType(type: LogTransactionType | null) {
  logTransactionStore.setState((prev) => ({ ...prev, type }))
}
