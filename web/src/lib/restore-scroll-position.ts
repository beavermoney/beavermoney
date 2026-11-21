type Position = { scrollX: number; scrollY: number }

// Router restoration runs once after rendering. Suspense and paginated lists
// can still be shorter than the saved position then. Follow content growth
// until that position is reachable, letting the list's sentinel fetch pages.
export function restoreScrollPosition(node: HTMLElement, position: Position) {
  let active = true
  const resize = new ResizeObserver(restore)
  const mutations = new MutationObserver(() => {
    if (!active) return
    observeContent()
    restore()
  })
  const keys = new Set([
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
  ])
  function onKey(event: KeyboardEvent) {
    if (keys.has(event.key)) stop()
  }
  function stop() {
    active = false
    resize.disconnect()
    mutations.disconnect()
    node.removeEventListener('wheel', stop)
    node.removeEventListener('touchstart', stop)
    node.removeEventListener('pointerdown', stop)
    node.removeEventListener('keydown', onKey)
  }
  function observeContent() {
    resize.disconnect()
    resize.observe(node)
    for (const child of node.children) resize.observe(child)
  }
  function restore() {
    if (!active) return
    node.scrollLeft = position.scrollX
    node.scrollTop = position.scrollY
    if (
      Math.abs(node.scrollTop - position.scrollY) <= 1 &&
      Math.abs(node.scrollLeft - position.scrollX) <= 1
    )
      stop()
  }
  // The user's own scrolling always wins over a pending restoration.
  node.addEventListener('wheel', stop, { passive: true })
  node.addEventListener('touchstart', stop, { passive: true })
  node.addEventListener('pointerdown', stop, { passive: true })
  node.addEventListener('keydown', onKey)
  observeContent()
  mutations.observe(node, {
    childList: true,
    subtree: true,
    characterData: true,
  })
  restore()
  return stop
}
