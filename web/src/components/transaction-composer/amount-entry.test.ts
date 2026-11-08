import { describe, expect, it } from 'vitest'
import { calculateAmount, editAmount } from './amount-entry'

describe('mobile amount entry', () => {
  it('keeps decimal cents exact when adding and subtracting', () => {
    expect(calculateAmount('0.1', '0.2', '+', '.', 2)).toBe('0.3')
    expect(calculateAmount('100', '99.99', '-', '.', 2)).toBe('0.01')
    expect(calculateAmount('1', '2', '-', '.', 2)).toBe('-1')
  })
  it('supports locale decimals and fractional shares', () => {
    expect(calculateAmount('12,50', '0,05', '+', ',', 2)).toBe('12,55')
    expect(calculateAmount('0.00000001', '0.00000002', '+', '.', 8)).toBe(
      '0.00000003',
    )
  })
  it('preserves partial input, limits precision, and supports deletion', () => {
    expect(editAmount('', ',', ',', 2)).toBe('0,')
    expect(editAmount('0,', ',', ',', 2)).toBe('0,')
    expect(editAmount('1,23', '4', ',', 2)).toBe('1,23')
    expect(editAmount('1,23', 'backspace', ',', 2)).toBe('1,2')
    expect(editAmount('0', '5', '.', 2)).toBe('5')
  })
})
