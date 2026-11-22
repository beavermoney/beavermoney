// URL/history updates precede async route completion. Layout and transient view
// state must continue to describe the page actually on screen during that gap.
export function presentedLocation<T>(state: {
  location: T
  resolvedLocation?: T
  isLoading?: boolean
}): T {
  return state.isLoading
    ? (state.resolvedLocation ?? state.location)
    : state.location
}
