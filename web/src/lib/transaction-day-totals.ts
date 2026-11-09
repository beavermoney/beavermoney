import currency from 'currency.js'

type Transaction = {
  excludeFromReports: boolean
  category: { type: string }
  transactionEntries?:
    | readonly {
        amount: string
        account: { user: { id: string }; householdCurrency: { code: string } }
      }[]
    | null
}
export function transactionDayTotals(
  transactions: readonly Transaction[],
  convert: (amount: string, code: string) => currency,
  viewUserIds: readonly string[] | null,
) {
  let income = currency(0)
  let expense = currency(0)
  for (const transaction of transactions) {
    if (
      transaction.excludeFromReports ||
      !['income', 'expense'].includes(transaction.category.type)
    )
      continue
    for (const entry of transaction.transactionEntries ?? []) {
      if (viewUserIds && !viewUserIds.includes(entry.account.user.id)) continue
      const amount = convert(entry.amount, entry.account.householdCurrency.code)
      if (transaction.category.type === 'income') income = income.add(amount)
      else expense = expense.subtract(amount)
    }
  }
  return { income, expense }
}
