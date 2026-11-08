import { Icon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { ChevronRightIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

export function ComposerChipRail({ children }: { children: ReactNode }) {
  const [rail, setRail] = useState<HTMLElement | null>(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (!rail) return
    const update = () => {
      setHasMore(rail.scrollWidth - rail.clientWidth - rail.scrollLeft > 1)
    }
    update()
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(rail)
    for (const child of rail.children) observer?.observe(child)
    rail.addEventListener('scroll', update, { passive: true })
    return () => {
      observer?.disconnect()
      rail.removeEventListener('scroll', update)
    }
  }, [rail, children])

  return (
    <Stack className="composer-chip-rail" data-has-more={hasMore}>
      <Stack
        ref={setRail}
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
