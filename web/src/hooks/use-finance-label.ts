import { useLingui } from '@lingui/react/macro'

// Translate display labels only; enum values sent to GraphQL stay unchanged.
export function useFinanceLabel() {
  const { t } = useLingui()
  return (value: string): string => {
    switch (value) {
      case 'liquidity':
        return t`Liquidity`
      case 'investment':
        return t`Investment`
      case 'property':
        return t`Property`
      case 'receivable':
        return t`Receivable`
      case 'liability':
        return t`Liability`
      case 'expense':
        return t`Expense`
      case 'income':
        return t`Income`
      case 'transfer':
        return t`Transfer`
      case 'setup':
        return t`Setup`
      case 'stock':
        return t`Stock`
      case 'crypto':
        return t`Crypto`
      case 'day':
        return t`Day`
      case 'week':
        return t`Week`
      case 'month':
        return t`Month`
      case 'year':
        return t`Year`
      case 'buy':
        return t`Buy`
      case 'sell':
        return t`Sell`
      case 'move':
        return t`Move`
      default:
        return value
    }
  }
}
