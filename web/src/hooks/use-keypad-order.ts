import { useSyncExternalStore } from 'react'

export type KeypadOrder = 'phone' | 'calculator'
const key = 'beaver-keypad-order'
const event = 'beaver-keypad-order-change'

function read(): KeypadOrder {
  return localStorage.getItem(key) === 'calculator' ? 'calculator' : 'phone'
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(event, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(event, callback)
  }
}

export function useKeypadOrder() {
  const keypadOrder = useSyncExternalStore(
    subscribe,
    read,
    () => 'phone' as KeypadOrder,
  )
  return {
    keypadOrder,
    setKeypadOrder: (value: KeypadOrder) => {
      localStorage.setItem(key, value)
      window.dispatchEvent(new Event(event))
    },
  }
}
