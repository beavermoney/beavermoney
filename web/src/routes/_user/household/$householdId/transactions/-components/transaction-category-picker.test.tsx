// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { TransactionCategoryPicker } from './transaction-category-picker'

const mobileState = vi.hoisted(() => ({ value: true }))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mobileState.value,
}))
vi.mock('@/components/selection-rows', () => ({
  SelectionRows: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock('@/components/category-icon', () => ({
  CategoryIcon: () => <span aria-hidden="true" />,
}))
vi.mock('relay-runtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('relay-runtime')>()),
  readInlineData: (_fragment: unknown, fragmentRef: unknown) => fragmentRef,
}))

const categories = [
  { id: 'groceries', name: 'Groceries', type: 'expense' },
  { id: 'transport', name: 'Transport', type: 'expense' },
]

function Picker() {
  const [value, setValue] = useState('')
  return (
    <TransactionCategoryPicker
      categories={categories as never}
      name="category"
      value={value}
      onValueChange={setValue}
      onBlur={() => undefined}
      invalid={false}
    />
  )
}

afterEach(() => {
  cleanup()
  mobileState.value = true
})

it('collapses to the selected category and expands when clicked', () => {
  render(<Picker />)

  fireEvent.click(screen.getByRole('radio', { name: 'Groceries' }))
  const summary = screen.getByRole('button', { name: 'Category: Groceries' })
  expect(screen.queryByRole('radio', { name: 'Transport' })).toBeNull()

  fireEvent.click(summary)
  expect(screen.getByRole('radio', { name: 'Transport' })).not.toBeNull()
})

it('shows the full category display in desktop options and the selected trigger', () => {
  mobileState.value = false
  render(<Picker />)

  fireEvent.click(
    screen.getByRole('button', { name: 'Category: Select a category' }),
  )
  expect(
    screen.getByRole('group', { name: 'Scrollable content' }),
  ).not.toBeNull()
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Groceries' }))

  expect(screen.queryByRole('menu')).toBeNull()
  expect(
    screen.getByRole('button', { name: 'Category: Groceries' }),
  ).toBeTruthy()
})
