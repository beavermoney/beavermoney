import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { merchantTransactionFilter } from './merchant-transaction-filter'
import query from './__generated__/merchantDetailQuery.graphql'
import type { merchantDetailQuery } from './__generated__/merchantDetailQuery.graphql'

export function merchantDetailVariables(
  householdId: string,
  merchantId: string | null,
  start: string,
  end: string,
): merchantDetailQuery['variables'] {
  const viewUserIds = readViewUserIds(householdId)
  return {
    id: merchantId ?? '0',
    assigned: merchantId !== null,
    ...parseDateRangeFromURL(start, end),
    viewUserIds,
    where: merchantTransactionFilter(merchantId, start, end, viewUserIds),
  }
}
export function loadMerchantDetail(
  householdId: string,
  merchantId: string | null,
  start: string,
  end: string,
) {
  return loadRouteQuery<merchantDetailQuery>(
    environment,
    query,
    merchantDetailVariables(householdId, merchantId, start, end),
    { fetchPolicy: 'store-or-network' },
  )
}
