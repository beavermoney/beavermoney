// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { CategoryGlyph } from './category-glyph'

const { loadIcon } = vi.hoisted(() => ({
  loadIcon: vi.fn(async () => ({
    __iconNode: [['path', { d: 'M0 0L1 1', key: 'test' }]],
  })),
}))
vi.mock('lucide-react/dynamic', () => ({
  dynamicIconImports: { wallet: loadIcon },
}))

it('immediately renders a cached icon on remount', async () => {
  const first = render(
    <CategoryGlyph name="wallet" fallback={<span>Loading icon</span>} />,
  )
  await act(async () => {
    await Promise.resolve()
  })
  expect(first.container.querySelector('svg')).not.toBeNull()
  first.unmount()
  const second = render(
    <CategoryGlyph name="wallet" fallback={<span>Loading icon</span>} />,
  )
  expect(second.container.querySelector('svg')).not.toBeNull()
  expect(screen.queryByText('Loading icon')).toBeNull()
  expect(loadIcon).toHaveBeenCalledTimes(1)
  second.unmount()
})
