import { useLazyLoadQuery, useSubscribeToInvalidationState } from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import { environment } from '@/environment'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { LogTransaction } from '@/routes/_user/household/$householdId/transactions/-components/log-transaction'
import type { transactionEntryContentQuery } from './__generated__/transactionEntryContentQuery.graphql'

const query = graphql`
  query transactionEntryContentQuery($viewUserIds: [ID!]) {
    household {
      ...logTransactionFragment @arguments(viewUserIds: $viewUserIds)
    }
  }
`

export default function TransactionEntryContent() {
  const { household } = useHousehold()
  const { viewUserIds } = useHouseholdViewScope()
  const variables = { viewUserIds }
  const data = useLazyLoadQuery<transactionEntryContentQuery>(query, variables)
  useSubscribeToInvalidationState([household.id], () => {
    fetchQuery(environment, query, variables, {
      fetchPolicy: 'network-only',
    }).subscribe({})
  })
  return <LogTransaction fragmentRef={data.household} />
}
