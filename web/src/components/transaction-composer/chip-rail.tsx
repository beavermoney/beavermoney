import { Icon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { ChevronRightIcon } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'

export function ComposerChipRail({ children }: { children: ReactNode }) {
  const [hasMore, setHasMore] = useState(false)

  const attachRail = useCallback((rail: HTMLElement | null) => {
    if (!rail) return
    const update = () => {
      setHasMore(rail.scrollWidth - rail.clientWidth - rail.scrollLeft > 1)
    }
    update()
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    const observeChildren = () => {
      observer?.disconnect()
      observer?.observe(rail)
      for (const child of rail.children) observer?.observe(child)
      update()
    }
    observeChildren()
    const mutations = new MutationObserver(observeChildren)
    mutations.observe(rail, { childList: true })
    rail.addEventListener('scroll', update, { passive: true })
    return () => {
      observer?.disconnect()
      mutations.disconnect()
      rail.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <Stack className="composer-chip-rail" data-has-more={hasMore}>
      <Stack
        ref={attachRail}
        direction="horizontal"
        gap={2}
        className="composer-chips"
        isScrollable
      >
        {children}
      </Stack>
      {hasMore && (
        <Stack
          className="composer-chip-hint"
          aria-hidden="true"
          vAlign="center"
          hAlign="center"
        >
          <Icon icon={ChevronRightIcon} />
        </Stack>
      )}
    </Stack>
  )
}
