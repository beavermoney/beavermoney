import { useSyncExternalStore } from 'react'

// Define the possible screen sizes as a const array for better type inference
export const SCREEN_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

// Create a union type from the array
export type ScreenSize = (typeof SCREEN_SIZES)[number]

// Type-safe size order mapping
const sizeOrder: Record<ScreenSize, number> = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 5,
} as const

class ComparableScreenSize {
  constructor(private value: ScreenSize) {}

  toString(): ScreenSize {
    return this.value
  }

  valueOf(): number {
    return sizeOrder[this.value]
  }

  // Add type predicate methods for better TypeScript support
  equals(other: ScreenSize): boolean {
    return this.value === other
  }

  lessThan(other: ScreenSize): boolean {
    return this.valueOf() < sizeOrder[other]
  }

  greaterThan(other: ScreenSize): boolean {
    return this.valueOf() > sizeOrder[other]
  }

  lessThanOrEqual(other: ScreenSize): boolean {
    return this.valueOf() <= sizeOrder[other]
  }

  greaterThanOrEqual(other: ScreenSize): boolean {
    return this.valueOf() >= sizeOrder[other]
  }
}

function readScreenSize(): ScreenSize {
  const width = window.innerWidth
  if (width >= 1536) return '2xl'
  if (width >= 1280) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 768) return 'md'
  if (width >= 640) return 'sm'
  return 'xs'
}

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

const useScreenSize = (): ComparableScreenSize => {
  const size = useSyncExternalStore(
    subscribe,
    readScreenSize,
    () => 'xs' as const,
  )
  return new ComparableScreenSize(size)
}

export { useScreenSize }
