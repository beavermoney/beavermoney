// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CurrencyInput } from './currency-input'

afterEach(cleanup)

it('keeps the decimal mobile keyboard when negative values are allowed', () => {
  render(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      allowNegative
      onValueChange={() => {}}
    />,
  )

  expect(screen.getByRole('textbox').getAttribute('inputmode')).toBe('decimal')
})

it('parses locale decimal separators before reporting the numeric value', () => {
  const onValueChange = vi.fn()
  render(
    <CurrencyInput
      locale="de-DE"
      currency="EUR"
      onValueChange={onValueChange}
    />,
  )

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '12,34' },
  })

  expect(onValueChange).toHaveBeenLastCalledWith({
    floatValue: 12.34,
    value: '12,34',
  })
})

it('reflects external value changes while preserving user edits', () => {
  const onValueChange = vi.fn()
  const { rerender } = render(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      value={undefined}
      onValueChange={onValueChange}
    />,
  )

  rerender(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      value={25}
      onValueChange={onValueChange}
    />,
  )

  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('25')

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '27.50' },
  })

  rerender(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      value={27.5}
      onValueChange={onValueChange}
    />,
  )

  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('27.50')
  expect(onValueChange).toHaveBeenLastCalledWith({
    floatValue: 27.5,
    value: '27.50',
  })
})

it('can hide the currency symbol for non-currency decimal values', () => {
  const { container } = render(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      value={10.5}
      showCurrencySymbol={false}
      onValueChange={() => {}}
    />,
  )

  expect(container.textContent).not.toContain('$')
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('10.5')
})

it('keeps a controlled zero visible for fractional entry', () => {
  const onValueChange = vi.fn()
  const { rerender } = render(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      value={undefined}
      onValueChange={onValueChange}
    />,
  )

  rerender(
    <CurrencyInput
      locale="en-US"
      currency="USD"
      value={0}
      onValueChange={onValueChange}
    />,
  )

  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('0')

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '0.5' },
  })

  expect(onValueChange).toHaveBeenLastCalledWith({
    floatValue: 0.5,
    value: '0.5',
  })
})
