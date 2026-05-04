import { useStore } from '@tanstack/react-store'
import { useRouter, useParams } from '@tanstack/react-router'
import { useCallback } from 'react'
import {
  setViewUserIds as persistViewUserIds,
  viewScopeStore,
} from './view-scope-store'

export function useHouseholdViewScope() {
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  const router = useRouter()

  const viewUserIds = useStore(
    viewScopeStore,
    (state) => state[householdId] ?? null,
  )

  const setViewUserIds = useCallback(
    (next: string[] | null) => {
      const normalized = next === null || next.length === 0 ? null : next
      persistViewUserIds(householdId, normalized)
      // Loaders read viewUserIds from localStorage at run time, so we just
      // need to invalidate routes — Relay's per-variables cache key handles
      // the rest (new scope = new cache entry; old scope stays warm).
      router.invalidate()
    },
    [householdId, router],
  )

  return {
    viewUserIds,
    isCombinedAll: viewUserIds === null,
    setViewUserIds,
  }
}
