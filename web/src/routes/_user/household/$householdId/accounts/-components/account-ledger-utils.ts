export const ACCOUNT_TYPE_ACCENT_CLASSES: Record<string, string> = {
  liquidity: 'bg-chart-liquidity',
  investment: 'bg-chart-investment',
  property: 'bg-chart-property',
  receivable: 'bg-chart-receivable',
  liability: 'bg-chart-liability',
  asset: 'bg-chart-asset',
}

export function formatPercentageWithPrivacyMode(
  value: number | null,
  locale: string,
  isPrivacyModeEnabled: boolean,
) {
  if (isPrivacyModeEnabled) return '•••'
  if (value === null || !Number.isFinite(value)) return '—'
  if (value === 0) return '0%'
  if (Math.abs(value) < 0.01) {
    const threshold = Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(value < 0 ? -0.0001 : 0.0001)
    return `${value < 0 ? '>' : '<'}${threshold}`
  }

  return Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: Math.abs(value) < 1 ? 2 : 1,
  }).format(value / 100)
}

// Liability values are stored as negative debt; display debt as positive.
export function getAccountDisplayValue(value: number, type: string) {
  return type === 'liability' ? -value : value
}

export function calculateAllocationPercentage(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0)
    return null
  const percentage = (value / Math.abs(total)) * 100
  return Number.isFinite(percentage) ? percentage : null
}

export function getAccountGroupAllocation(
  groupValue: number,
  totalAssets: number,
  isLiability = false,
) {
  return {
    share: calculateAllocationPercentage(
      getAccountDisplayValue(groupValue, isLiability ? 'liability' : 'asset'),
      totalAssets,
    ),
    basis: 'assets' as const,
  }
}
