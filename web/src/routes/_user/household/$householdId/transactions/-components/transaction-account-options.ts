import { readInlineData } from 'relay-runtime'
import type { transactionAccountPickerFragment$key } from './__generated__/transactionAccountPickerFragment.graphql'
import fragment from './__generated__/transactionAccountPickerFragment.graphql'

type Account = transactionAccountPickerFragment$key & {
  id: string
  type: string
}

export function defaultAccountId(
  accounts: readonly Account[],
  preferredTypes?: readonly string[],
): string {
  return (
    [...accounts].sort((a, b) => {
      const preference =
        Number(!preferredTypes?.includes(a.type)) -
        Number(!preferredTypes?.includes(b.type))
      return (
        preference ||
        (
          readInlineData(fragment, b).latestTransaction?.datetime ?? ''
        ).localeCompare(
          readInlineData(fragment, a).latestTransaction?.datetime ?? '',
        )
      )
    })[0]?.id ?? ''
  )
}
