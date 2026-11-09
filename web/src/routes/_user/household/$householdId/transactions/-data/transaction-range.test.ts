import { expect, it, vi } from 'vitest'
import {
  Environment,
  Network,
  RecordSource,
  Store,
  commitLocalUpdate,
  createOperationDescriptor,
  fetchQuery,
  getRequest,
  type GraphQLResponse,
} from 'relay-runtime'
import { loadQuery } from 'react-relay'
import transactionsQueryNode from '../__generated__/transactionsQuery.graphql'
import panelQueryNode from '../-components/__generated__/transactionsPanelRefetchQuery.graphql'
import {
  transactionRangeVariables,
  withPreparedTransactionRange,
} from './transaction-range'

const household = {
  __typename: 'Household',
  id: 'household-1',
  transactions: {
    edges: [],
    pageInfo: { hasNextPage: false, endCursor: null },
  },
  financialReport: {
    incomeBreakdown: { total: '0' },
    expensesBreakdown: { total: '0' },
  },
}
const variables = transactionRangeVariables('2026-06-01', '2026-06-30', null)
const operation = createOperationDescriptor(
  getRequest(transactionsQueryNode),
  variables,
)

it('refreshes the route operation after invalidation, so navigation does not fetch and suspend again', async () => {
  let complete: ((response: GraphQLResponse) => void) | undefined
  let slow = false
  const network = vi.fn((request: { name: string }) => {
    if (slow)
      return new Promise<GraphQLResponse>((resolve) => {
        complete = resolve
      })
    return Promise.resolve({
      data:
        request.name === 'transactionsQuery'
          ? { household }
          : { node: household },
    })
  })
  const environment = new Environment({
    network: Network.create(network),
    store: new Store(new RecordSource()),
  })
  await fetchQuery(environment, transactionsQueryNode, variables).toPromise()
  const retained = environment.retain(operation)
  commitLocalUpdate(environment, (store) =>
    store.get(household.id)?.invalidateRecord(),
  )
  await fetchQuery(environment, panelQueryNode, {
    ...variables,
    id: household.id,
  }).toPromise()
  expect(environment.check(operation).status).toBe('stale')

  slow = true
  const navigate = vi.fn(async () => {
    expect(environment.check(operation).status).toBe('available')
    const calls = network.mock.calls.length
    const queryRef = loadQuery(environment, transactionsQueryNode, variables, {
      fetchPolicy: 'store-or-network',
    })
    expect(network).toHaveBeenCalledTimes(calls)
    queryRef.dispose()
  })
  const pending = withPreparedTransactionRange(environment, variables, navigate)
  expect(navigate).not.toHaveBeenCalled()
  complete!({ data: { household } })
  await pending
  expect(navigate).toHaveBeenCalledOnce()
  retained.dispose()
})

it('leaves the current route in place on a network error and releases its temporary retention', async () => {
  const environment = new Environment({
    network: Network.create(() => Promise.reject(new Error('offline'))),
    store: new Store(new RecordSource()),
  })
  const dispose = vi.fn()
  vi.spyOn(environment, 'retain').mockReturnValue({ dispose })
  const navigate = vi.fn()
  await expect(
    withPreparedTransactionRange(environment, variables, navigate),
  ).rejects.toThrow('offline')
  expect(navigate).not.toHaveBeenCalled()
  expect(dispose).toHaveBeenCalledOnce()
})
