import { useLazyLoadQuery } from 'react-relay'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import query from './__generated__/transactionEntryContentQuery.graphql'
import type { transactionEntryContentQuery } from './__generated__/transactionEntryContentQuery.graphql'

// Gate the portal on the same query consumed by TransactionEntryContent.
export function useTransactionEntryData() {
  const { viewUserIds } = useHouseholdViewScope()
  return useLazyLoadQuery<transactionEntryContentQuery>(query, { viewUserIds })
}
