import { Store } from '@tanstack/store'
import { LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY } from '@/constant'

export const displayCurrencyIdStore = new Store(
  localStorage.getItem(LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY) ?? '',
)

export function setDisplayCurrencyId(id: string) {
  if (id) {
    localStorage.setItem(LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY, id)
  } else {
    localStorage.removeItem(LOCAL_STORAGE_DISPLAY_CURRENCY_ID_KEY)
  }
  displayCurrencyIdStore.setState(() => id)
}
