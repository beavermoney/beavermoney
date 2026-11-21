import Decimal from 'decimal.js'

const Exact = Decimal.clone({ precision: 60 })
type Holding = {
  readonly symbol: string
  readonly amount: string
  readonly value: string
  readonly householdCurrency: { readonly code: string }
}
type Rate = {
  readonly rate: string
  readonly fromCurrency: { readonly code: string }
  readonly toCurrency: { readonly code: string }
}

// Preserve each holding's identity so its shortcut opens that account's holding.
export function rankInvestmentHoldings<T extends Holding>(
  holdings: readonly T[],
  accountCurrency: string,
  rates: readonly Rate[],
): T[] {
  return holdings
    .filter((holding) => !new Exact(holding.amount).isZero())
    .map((holding) => {
      const from = holding.householdCurrency.code
      const rate =
        from === accountCurrency
          ? '1'
          : rates.find(
              (rate) =>
                rate.fromCurrency.code === from &&
                rate.toCurrency.code === accountCurrency,
            )?.rate
      return {
        holding,
        value:
          rate && new Exact(rate).gt(0)
            ? new Exact(holding.value).mul(rate)
            : null,
      }
    })
    .sort((a, b) => {
      if (a.value === null && b.value !== null) return 1
      if (a.value !== null && b.value === null) return -1
      return (
        (a.value && b.value ? b.value.cmp(a.value) : 0) ||
        a.holding.symbol.localeCompare(b.holding.symbol)
      )
    })
    .map(({ holding }) => holding)
}
