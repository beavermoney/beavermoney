import { describe, expect, it } from 'vitest'

import {
  calculateAllocationPercentage,
  formatPercentageWithPrivacyMode,
  getAccountDisplayValue,
  getAccountGroupAllocation,
} from './account-ledger-utils'

describe('getAccountDisplayValue', () => {
  it('puts debts ahead of credits when sorting liabilities largest first', () => {
    const balances = [84.69, -19.77, -28984.99, 5.24, 0]
    expect(
      balances.sort(
        (a, b) =>
          getAccountDisplayValue(b, 'liability') -
          getAccountDisplayValue(a, 'liability'),
      ),
    ).toEqual([-28984.99, -19.77, 0, 5.24, 84.69])
  })

  it('puts positive liquidity ahead of overdrafts', () => {
    const balances = [-1000, 20, 0, 100, -5]
    expect(
      balances.sort(
        (a, b) =>
          getAccountDisplayValue(b, 'liquidity') -
          getAccountDisplayValue(a, 'liquidity'),
      ),
    ).toEqual([100, 20, 0, -5, -1000])
  })
})

describe('calculateAllocationPercentage', () => {
  it('keeps debt positive and overpayment negative within a liability group', () => {
    expect(
      calculateAllocationPercentage(
        getAccountDisplayValue(-1000, 'liability'),
        -900,
      ),
    ).toBeCloseTo(111.111111)
    expect(
      calculateAllocationPercentage(
        getAccountDisplayValue(100, 'liability'),
        -900,
      ),
    ).toBeCloseTo(-11.111111)
  })

  it('keeps an overdraft negative, even when the group total is negative', () => {
    expect(calculateAllocationPercentage(-250, 1000)).toBe(-25)
    expect(calculateAllocationPercentage(-250, -1000)).toBe(-25)
    expect(calculateAllocationPercentage(250, -1000)).toBe(25)
  })

  it('returns undefined shares for zero totals and invalid inputs', () => {
    expect(calculateAllocationPercentage(250, 0)).toBeNull()
    expect(calculateAllocationPercentage(0, 0)).toBeNull()
    expect(calculateAllocationPercentage(NaN, 100)).toBeNull()
    expect(calculateAllocationPercentage(100, Infinity)).toBeNull()
    expect(calculateAllocationPercentage(Number.MAX_VALUE, 0.01)).toBeNull()
    expect(calculateAllocationPercentage(0, 100)).toBe(0)
  })
})

describe('formatPercentageWithPrivacyMode', () => {
  it('preserves signs and precision', () => {
    expect(formatPercentageWithPrivacyMode(-0.26, 'en-CA', false)).toBe(
      '-0.26%',
    )
    expect(formatPercentageWithPrivacyMode(111.111, 'en-CA', false)).toBe(
      '111.1%',
    )
    expect(formatPercentageWithPrivacyMode(-25, 'en-CA', false)).toBe('-25%')
    expect(formatPercentageWithPrivacyMode(0, 'en-CA', false)).toBe('0%')
  })

  it('distinguishes tiny shares from zero and undefined shares', () => {
    expect(formatPercentageWithPrivacyMode(0.001, 'en-CA', false)).toBe(
      '<0.01%',
    )
    expect(formatPercentageWithPrivacyMode(-0.001, 'en-CA', false)).toBe(
      '>-0.01%',
    )
    expect(formatPercentageWithPrivacyMode(null, 'en-CA', false)).toBe('—')
    expect(formatPercentageWithPrivacyMode(Infinity, 'en-CA', false)).toBe('—')
  })

  it('masks positive, negative, and undefined shares in privacy mode', () => {
    for (const value of [25, -25, 0, null]) {
      expect(formatPercentageWithPrivacyMode(value, 'en-CA', true)).toBe('•••')
    }
  })
})

describe('getAccountGroupAllocation', () => {
  it('calculates debt and overpayments against total assets with their signs', () => {
    expect(getAccountGroupAllocation(-250, 2000, true)).toEqual({
      share: 12.5,
      basis: 'assets',
    })
    expect(getAccountGroupAllocation(250, 2000, true).share).toBe(-12.5)
  })

  it('preserves negative liquidity and handles no assets', () => {
    expect(getAccountGroupAllocation(-250, 2000).share).toBe(-12.5)
    expect(getAccountGroupAllocation(250, 0).share).toBeNull()
  })
})
