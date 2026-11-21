import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useCallback, type ComponentProps } from 'react'

// Reveal overflowing names without changing the size of the picker button.
export function ScrollingName({
  children,
  centered = false,
  type,
  size,
}: {
  children: string
  centered?: boolean
} & Pick<ComponentProps<typeof Text>, 'type' | 'size'>) {
  const attach = useCallback((viewport: HTMLElement | null) => {
    if (!viewport) return
    const text = viewport.firstElementChild as HTMLElement | null
    if (
      !text ||
      typeof text.animate !== 'function' ||
      typeof ResizeObserver === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animation: Animation | undefined
    let previousDistance = -1
    const update = () => {
      const distance = Math.max(0, text.scrollWidth - viewport.clientWidth)
      if (distance === previousDistance) return
      previousDistance = distance
      animation?.cancel()
      animation = undefined
      if (distance <= 1 || reducedMotion.matches) return
      // Reading motion is deliberately slow, with a pause at both ends.
      const pause = 1600
      const travel = Math.max(1200, (distance / 24) * 1000)
      const duration = 2 * (pause + travel)
      animation = text.animate(
        [
          { transform: 'translateX(0)', offset: 0 },
          { transform: 'translateX(0)', offset: pause / duration },
          {
            transform: `translateX(-${distance}px)`,
            offset: (pause + travel) / duration,
          },
          {
            transform: `translateX(-${distance}px)`,
            offset: (2 * pause + travel) / duration,
          },
          { transform: 'translateX(0)', offset: 1 },
        ],
        { duration, iterations: Infinity, easing: 'linear' },
      )
    }
    const preferenceChanged = () => {
      previousDistance = -1
      update()
    }
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    observer.observe(text)
    reducedMotion.addEventListener('change', preferenceChanged)
    update()
    return () => {
      observer.disconnect()
      reducedMotion.removeEventListener('change', preferenceChanged)
      animation?.cancel()
    }
  }, [])

  return (
    <Stack
      key={children}
      ref={attach}
      className="w-full min-w-0 overflow-hidden"
    >
      <Text
        type={type ?? (centered ? 'label' : undefined)}
        size={size}
        color="inherit"
        className={`block w-max max-w-none whitespace-nowrap motion-reduce:w-full motion-reduce:truncate ${centered ? 'min-w-full text-center' : ''}`}
      >
        {children}
      </Text>
    </Stack>
  )
}
