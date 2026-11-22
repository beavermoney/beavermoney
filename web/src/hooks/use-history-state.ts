import { presentedLocation } from '@/lib/presented-location'
import { getHistoryViewKey } from '@/lib/history-view-key'
import { useCallback, useSyncExternalStore, type SetStateAction } from 'react'
import { useRouterState } from '@tanstack/react-router'

const storageKey = 'beaver-history-view-state-v1'
type Entry = Record<string, unknown>
const entries = new Map<string, Entry>()
const listeners = new Set<() => void>()
try {
  const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
  if (Array.isArray(saved)) {
    for (const item of saved.slice(-100)) {
      if (
        Array.isArray(item) &&
        typeof item[0] === 'string' &&
        item[1] &&
        typeof item[1] === 'object'
      ) {
        entries.set(item[0], item[1])
      }
    }
  }
} catch {
  /* Storage is optional, including in private browsing. */
}

export function readHistoryState<T>(key: string, name: string, initial: T): T {
  const stored = entries.get(key)?.[name]
  return stored === undefined ? initial : (stored as T)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Only transient presentation state belongs here, never financial data. Each
// history entry has its own layout, so Back and Forward restore it before paint.
export function useHistoryState<T>(name: string, initial: T) {
  const key = useRouterState({
    select: (state) => getHistoryViewKey(presentedLocation(state)),
  })
  const stored = useSyncExternalStore(subscribe, () => entries.get(key)?.[name])
  const value = stored === undefined ? initial : (stored as T)
  const setValue = useCallback(
    (update: SetStateAction<T>) => {
      const previous = entries.get(key)?.[name] as T | undefined
      const next =
        typeof update === 'function'
          ? (update as (previous: T) => T)(
              previous === undefined ? initial : previous,
            )
          : update
      entries.set(key, { ...entries.get(key), [name]: next })
      while (entries.size > 100) entries.delete(entries.keys().next().value!)
      try {
        sessionStorage.setItem(storageKey, JSON.stringify([...entries]))
      } catch {
        /* Keep the in-memory state. */
      }
      for (const listener of listeners) listener()
    },
    [key, name, initial],
  )
  return [value, setValue] as const
}
