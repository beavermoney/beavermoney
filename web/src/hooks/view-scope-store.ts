import { Store } from '@tanstack/react-store'
import { LOCAL_STORAGE_VIEW_USER_ID_KEY_PREFIX } from '@/constant'

const storeCache = new Map<string, Store<string | null>>()

function getStorageKey(householdId: string): string {
  return LOCAL_STORAGE_VIEW_USER_ID_KEY_PREFIX + householdId
}

export function viewUserIdStoreFor(householdId: string): Store<string | null> {
  let store = storeCache.get(householdId)
  if (!store) {
    const stored = localStorage.getItem(getStorageKey(householdId))
    store = new Store<string | null>(stored ?? null)
    storeCache.set(householdId, store)
  }
  return store
}

export function getViewUserId(householdId: string): string | null {
  return localStorage.getItem(getStorageKey(householdId))
}

export function setViewUserId(householdId: string, value: string | null): void {
  const store = viewUserIdStoreFor(householdId)
  store.setState(() => value)
  if (value === null) {
    localStorage.removeItem(getStorageKey(householdId))
  } else {
    localStorage.setItem(getStorageKey(householdId), value)
  }
}

export function clearViewUserId(householdId: string): void {
  setViewUserId(householdId, null)
}
