import type { UseMutationConfig } from 'react-relay'
import type { Disposable, MutationParameters } from 'relay-runtime'

type MutationResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error | ReadonlyArray<unknown> }

type CommitMutation<T extends MutationParameters> = (
  config: UseMutationConfig<T>,
) => Disposable

export function commitMutationResult<T extends MutationParameters>(
  mutation: CommitMutation<T>,
  config: UseMutationConfig<T>,
): Promise<MutationResult<T['response']>> {
  return new Promise((resolve) => {
    mutation({
      ...config,
      onCompleted: (response, errors) => {
        if (errors) {
          resolve({ status: 'error', error: errors })
          return
        }

        resolve({ status: 'success', data: response })
      },
      onError: (err) => {
        resolve({ status: 'error', error: err })
      },
    })
  })
}
