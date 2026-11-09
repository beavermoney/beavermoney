import { parseDateRangeFromURL } from '@/lib/date-range'
import {
  createOperationDescriptor,
  fetchQuery,
  getRequest,
  type IEnvironment,
} from 'relay-runtime'
import type { transactionsQuery } from '../__generated__/transactionsQuery.graphql'
import transactionsQueryNode from '../__generated__/transactionsQuery.graphql'

export function transactionRangeVariables(
  start: string,
  end: string,
  viewUserIds: ReadonlyArray<string> | null,
): transactionsQuery['variables'] {
  const period = parseDateRangeFromURL(start, end)
  return {
    ...period,
    viewUserIds,
    where: {
      datetimeGTE: period.startDate,
      datetimeLT: period.endDate,
      ...(viewUserIds !== null && {
        hasTransactionEntriesWith: [
          { hasAccountWith: [{ userIDIn: viewUserIds }] },
        ],
      }),
    },
  }
}

export async function withPreparedTransactionRange(
  environment: IEnvironment,
  variables: transactionsQuery['variables'],
  navigate: () => Promise<void>,
) {
  // Warm the exact route operation, including its freshness metadata. A node
  // refetch fills records but does not refresh a previously invalidated query.
  // Retain until navigation hands ownership to the route's preloaded query.
  const retained = environment.retain(
    createOperationDescriptor(getRequest(transactionsQueryNode), variables),
  )
  try {
    await fetchQuery<transactionsQuery>(
      environment,
      transactionsQueryNode,
      variables,
      { fetchPolicy: 'network-only' },
    ).toPromise()
    await navigate()
  } finally {
    retained.dispose()
  }
}
