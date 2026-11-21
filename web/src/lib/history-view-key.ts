import type { ParsedLocation } from '@tanstack/react-router'

type ViewHistoryState = ParsedLocation['state'] & { beaverViewKey?: string }

// Opening a transient overlay replaces the URL, which gives TanStack history a
// new key. Keep the underlying page's presentation and scroll cache together.
export function getHistoryViewKey(location: ParsedLocation): string {
  const state: ViewHistoryState = location.state
  return state.beaverViewKey ?? state.__TSR_key ?? location.href
}

export function preserveHistoryViewKey(
  state: ViewHistoryState,
): ViewHistoryState {
  return {
    ...state,
    beaverViewKey: state.beaverViewKey ?? state.__TSR_key,
  }
}
