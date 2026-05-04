import { Store } from '@tanstack/store'
import { LOCAL_STORAGE_VIEW_USER_IDS_KEY } from '@/constant'

// Per-household selected owner ids. null = "all" (combined view).
type ViewScopeMap = Record<string, string[] | null>

function loadInitial(): ViewScopeMap {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(LOCAL_STORAGE_VIEW_USER_IDS_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ViewScopeMap
    }
  } catch {
    // fall through, corrupt entry — treat as empty.
  }
  return {}
}

export const viewScopeStore = new Store<ViewScopeMap>(loadInitial())

function persist(state: ViewScopeMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    LOCAL_STORAGE_VIEW_USER_IDS_KEY,
    JSON.stringify(state),
  )
}

export function setViewUserIds(
  householdId: string,
  next: string[] | null,
): void {
  viewScopeStore.setState((prev) => {
    const updated = { ...prev, [householdId]: next }
    persist(updated)
    return updated
  })
}

// readViewUserIds is safe to call from a route loader (synchronous, reads
// straight from localStorage). The Store is hydrated from the same key, so
// this stays consistent with what the hook returns to components.
export function readViewUserIds(householdId: string): string[] | null {
  return viewScopeStore.state[householdId] ?? null
}
