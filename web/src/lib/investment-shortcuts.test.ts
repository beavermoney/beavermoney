import { describe, expect, it } from 'vitest'
import { rankInvestmentHoldings } from './investment-shortcuts'
const holding = (
  id: string,
  symbol: string,
  value: string,
  code = 'CAD',
  amount = '1',
) => ({ id, symbol, value, amount, householdCurrency: { code } })
const rates = [
  { rate: '1.4', fromCurrency: { code: 'USD' }, toCurrency: { code: 'CAD' } },
]
describe('investment shortcuts', () => {
  it('ranks in account currency and retains the exact holding IDs for navigation', () => {
    const holdings = [
      holding('canadian', 'A', '100'),
      holding('american', 'B', '80', 'USD'),
    ]
    expect(
      rankInvestmentHoldings(holdings, 'CAD', rates).map((h) => h.id),
    ).toEqual(['american', 'canadian'])
    expect(holdings.map((h) => h.id)).toEqual(['canadian', 'american'])
  })
  it('excludes closed holdings without discarding tiny fractional positions', () => {
    const holdings = [
      holding('closed', 'A', '1000', 'CAD', '0'),
      holding('fraction', 'B', '0.00000001', 'CAD', '0.000000000000000001'),
    ]
    expect(
      rankInvestmentHoldings(holdings, 'CAD', []).map((h) => h.id),
    ).toEqual(['fraction'])
    expect(rankInvestmentHoldings([], 'CAD', [])).toEqual([])
  })
  it('keeps holdings accessible when FX is missing, after valued holdings', () => {
    const holdings = [
      holding('missing', 'A', '100', 'EUR'),
      holding('known', 'Z', '10'),
    ]
    expect(
      rankInvestmentHoldings(holdings, 'CAD', []).map((h) => h.id),
    ).toEqual(['known', 'missing'])
  })
})
