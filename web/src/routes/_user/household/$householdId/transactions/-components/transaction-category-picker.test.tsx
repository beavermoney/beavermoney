// @vitest-environment jsdom
import '@/test/browser-setup'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { ComposerContext } from '@/components/transaction-composer/context'
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
  fireEvent.click(screen.getByRole('button', { name: /Category/ }))
  const input = screen.getByRole('combobox')
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
  fireEvent.click(screen.getByRole('button', { name: /Category/ }))
  const input = screen.getByRole('combobox')
  fireEvent.change(input, { target: { value: 'no-such-category' } })
  expect(await screen.findByText('No categories available.')).toBeTruthy()
})

it('searches compact composer categories and selects a transfer type', () => {
  const choose = vi.fn()
  const change = vi.fn()
  render(
    <ComposerContext
      value={{
        activeAmount: 'amount',
        setActiveAmount: vi.fn(),
        editor: null,
        setEditor: vi.fn(),
        target: null,
        keypadTarget: null,
        dateField: null,
        compactCategories: true,
        chooseCategory: choose,
      }}
    >
      <TransactionCategoryPicker
        categories={
          [
            {
              id: 'transfer',
              name: 'Money Transfer',
              type: 'transfer',
              icon: null,
            },
            {
              id: 'fx',
              name: 'Foreign Exchange',
              type: 'transfer',
              icon: null,
            },
          ] as never
        }
        name="category"
        value="transfer"
        onValueChange={change}
        onBlur={vi.fn()}
        invalid={false}
      />
    </ComposerContext>,
  )
  const search = screen.getByRole('textbox', { name: 'Search categories' })
  expect(search.getAttribute('placeholder')).toBe('Search categories')
  fireEvent.change(search, { target: { value: 'foreign' } })
  expect(screen.queryByRole('button', { name: 'Money Transfer' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Foreign Exchange' }))
  expect(change).toHaveBeenCalledWith('fx')
  expect(choose).toHaveBeenCalledWith('Foreign Exchange', 'transfer', null)
})
