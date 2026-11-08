// @vitest-environment jsdom
import '@/test/browser-setup'
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

it('searches categories and allows keyboard selection', async () => {
  render(<Picker />)
  const input = screen.getByRole('combobox', { name: 'Category' })
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: 'groc' } })
  expect(await screen.findByRole('option', { name: /Groceries/ })).toBeTruthy()
  expect(screen.queryByRole('option', { name: /Transport/ })).toBeNull()
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(screen.queryByRole('listbox')).toBeNull()
  expect(screen.getByRole('button', { name: /Groceries/ })).toBeTruthy()
})

it('shows a useful empty search result', async () => {
  render(<Picker />)
  const input = screen.getByRole('combobox', { name: 'Category' })
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: 'no-such-category' } })
  expect(await screen.findByText('No categories available.')).toBeTruthy()
})
