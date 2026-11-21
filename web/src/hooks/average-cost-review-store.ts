import { useSyncExternalStore } from 'react'
let ids: readonly string[] = []
const listeners = new Set<() => void>()
export function requestAverageReview(next: readonly string[]) {
  ids = [...new Set(next)]
  listeners.forEach((listener) => listener())
}
export function useAverageReview() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => ids,
  )
}
