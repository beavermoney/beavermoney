import { loadQuery, type PreloadedQuery } from 'react-relay'
import type {
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
} from 'relay-runtime'

// A route is ready only when its Relay data is ready. Returning loadQuery
// immediately commits a page that then suspends into an unrelated placeholder.
export async function loadRouteQuery<T extends OperationType>(
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  variables: T['variables'],
  options?: Parameters<typeof loadQuery>[3],
): Promise<PreloadedQuery<T>> {
  const reference = loadQuery<T>(environment, query, variables, options)
  try {
    await reference.source?.toPromise()
    return reference
  } catch (error) {
    reference.dispose()
    throw error
  }
}
