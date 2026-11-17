import { createStore } from '@tanstack/store'

export type LogTransactionType =
  'expense' | 'income' | 'transfer' | 'buy' | 'sell' | 'move'

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

// An explicit "log from this account" action can target an already-open form.
// Keep that event separate from the initial defaults for a newly mounted form.
const defaultHandlers = new Map<
  LogTransactionType,
  Set<(defaults: LogTransactionDefaults) => void>
>()

export function registerTransactionDefaults(
  type: LogTransactionType,
  handler: (defaults: LogTransactionDefaults) => void,
) {
  const handlers = defaultHandlers.get(type) ?? new Set()
  defaultHandlers.set(type, handlers)
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
    if (!handlers.size) defaultHandlers.delete(type)
  }
}

export function deliverTransactionDefaults(
  type: LogTransactionType,
  defaults?: LogTransactionDefaults,
) {
  if (defaults)
    defaultHandlers.get(type)?.forEach((handler) => handler(defaults))
}
