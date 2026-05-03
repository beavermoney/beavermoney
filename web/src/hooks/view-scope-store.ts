import { Store } from '@tanstack/react-store'
import { LOCAL_STORAGE_VIEW_USER_ID_KEY } from '@/constant'

const storeCache = new Map<string, Store<string | null>>()

export function viewUserIdStoreFor(householdId: string): Store<string | null> {
  let store = storeCache.get(householdId)
  if (!store) {
    const stored = localStorage.getItem(LOCAL_STORAGE_VIEW_USER_ID_KEY)
    store = new Store<string | null>(stored ?? null)
    storeCache.set(householdId, store)
  }
  return store
}

export function getViewUserId(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_VIEW_USER_ID_KEY)
}

export function setViewUserId(householdId: string, value: string | null): void {
  const store = viewUserIdStoreFor(householdId)
  store.setState(() => value)
  if (value === null) {
    localStorage.removeItem(LOCAL_STORAGE_VIEW_USER_ID_KEY)
  } else {
    localStorage.setItem(LOCAL_STORAGE_VIEW_USER_ID_KEY, value)
  }
}

export function clearViewUserId(householdId: string): void {
  setViewUserId(householdId, null)
}
