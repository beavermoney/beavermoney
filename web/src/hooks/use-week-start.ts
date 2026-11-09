import { useSyncExternalStore } from 'react'

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6
const key = 'beaver-week-start'
const event = 'beaver-week-start-change'
function read(): WeekStart {
  const value = Number(localStorage.getItem(key))
  return Number.isInteger(value) && value >= 0 && value <= 6
    ? (value as WeekStart)
    : 0
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(event, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(event, callback)
  }
}
export function useWeekStart() {
  const weekStartsOn = useSyncExternalStore(
    subscribe,
    read,
    () => 0 as WeekStart,
  )
  return {
    weekStartsOn,
    setWeekStartsOn: (value: WeekStart) => {
      localStorage.setItem(key, String(value))
      window.dispatchEvent(new Event(event))
    },
  }
}
