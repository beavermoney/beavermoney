import type { UseMutationConfig } from 'react-relay'
import type { Disposable, MutationParameters } from 'relay-runtime'

// Define a Result type (Discriminated Union)
type MutationResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error | ReadonlyArray<unknown> }

export function commitMutationResult<T extends MutationParameters>(
  mutation: (config: UseMutationConfig<T>) => Disposable,
  config: UseMutationConfig<T>,
): Promise<MutationResult<T['response']>> {
  return new Promise((resolve) => {
    mutation({
      ...config,
      onCompleted: (response, errors) => {
        if (errors) {
          // Resolve with error status instead of rejecting
          resolve({ status: 'error', error: errors })
        } else {
          resolve({ status: 'success', data: response })
        }
      },
      onError: (err) => {
        resolve({ status: 'error', error: err })
      },
    })
  })
}
