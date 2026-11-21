import { parseDateRangeFromURL } from '@/lib/date-range'

export function merchantTransactionFilter(
  merchantId: string | null,
  start: string,
  end: string,
  viewUserIds: readonly string[] | null,
) {
  const period = parseDateRangeFromURL(start, end)
  return {
    ...(merchantId ? { merchantID: merchantId } : { merchantIDIsNil: true }),
    hasCategoryWith: [{ type: 'expense' as const }],
    excludeFromReports: false,
    datetimeGTE: period.startDate,
    datetimeLT: period.endDate,
    ...(viewUserIds !== null && {
      hasTransactionEntriesWith: [
        { hasAccountWith: [{ userIDIn: viewUserIds }] },
      ],
    }),
  }
}
