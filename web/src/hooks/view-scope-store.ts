import { Store } from '@tanstack/react-store'
import { LOCAL_STORAGE_VIEW_USER_ID_KEY } from '@/constant'

const initial =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(LOCAL_STORAGE_VIEW_USER_ID_KEY)
    : null

export const viewUserIdStore = new Store<string | null>(initial)

export function getViewUserId(): string | null {
  return viewUserIdStore.state
}

export function setViewUserId(value: string | null): void {
  viewUserIdStore.setState(() => value)
  if (value === null) {
    localStorage.removeItem(LOCAL_STORAGE_VIEW_USER_ID_KEY)
  } else {
    localStorage.setItem(LOCAL_STORAGE_VIEW_USER_ID_KEY, value)
  }
}

export function clearViewUserId(): void {
  setViewUserId(null)
}
