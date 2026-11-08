import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'
import { graphql, useFragment, useMutation } from 'react-relay'
import type { accountSettingsFragment$key } from './__generated__/accountSettingsFragment.graphql'
import type { accountSettingsUnarchiveMutation } from './__generated__/accountSettingsUnarchiveMutation.graphql'

import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

const fragment = graphql`
  fragment accountSettingsFragment on Query {
    accounts(where: { archived: true }) {
      edges {
        node {
          id
          name
          type
          archived
          user {
            name
          }
          householdCurrency {
            code
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation accountSettingsUnarchiveMutation($id: ID!) {
    unarchiveAccount(id: $id) {
      id
      archived
    }
  }
`

export function AccountSettings({
  fragmentRef,
}: {
  fragmentRef: accountSettingsFragment$key
}) {
  const showToast = useToast()
  const data = useFragment(fragment, fragmentRef)
  const { household } = useHousehold()
  const [commit, isInFlight] =
    useMutation<accountSettingsUnarchiveMutation>(mutation)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const accounts = (data.accounts.edges ?? [])
    .flatMap((edge) => (edge?.node?.archived ? [edge.node] : []))
    .sort((a, b) => a.name.localeCompare(b.name, household.locale))

  async function unarchive(id: string, name: string) {
    setPendingId(id)
    setFeedback('')
    const result = await commitMutationResult<accountSettingsUnarchiveMutation>(
      commit,
      {
        variables: { id },
        updater: (store) => store.get(household.id)?.invalidateRecord(),
      },
    )
    setPendingId(null)
    if (result.status === 'error') {
      showToast({
        type: 'error',
        body: `Could not unarchive ${name}. Please try again.`,
      })
      return
    }
    setFeedback(`${name} is active again. You can find it in Accounts.`)
    showToast({ type: 'info', body: `${name} unarchived.` })
  }

  return (
    <Stack
      direction="vertical"
      gap={4}
      as="section"

      aria-labelledby="account-settings-title"
    >
      <Stack direction="vertical" gap={4} as="header">
        <Heading level={1} id="account-settings-title">
          Account settings
        </Heading>
        <Text as="p" display="block" color="secondary">
          Bring archived accounts back into your ledger.
        </Text>
      </Stack>
      <Stack
        direction="vertical"
        gap={4}
        as="section"
        aria-labelledby="archived-accounts-title"
      >
        <Stack direction="vertical" gap={1}>
          <Heading level={2} id="archived-accounts-title">
            Archived accounts
          </Heading>
          <Text as="p" display="block" color="secondary">
            Unarchiving makes an account available for new transactions again.
            Its history stays intact.
          </Text>
        </Stack>
        {accounts.length === 0 ? (
          <Stack direction="vertical" gap={4}>
            <Stack direction="vertical" gap={2}>
              <Stack direction="vertical" gap={4}>
                <AstryxIcon icon={Archive} aria-hidden="true" />
              </Stack>
              <Heading level={2}>No archived accounts</Heading>
              <Stack direction="vertical" gap={4}>
                Accounts you archive will appear here when you need them again.
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <ul>
            {accounts.map((account) => (
              <li key={account.id}>
                <Stack direction="vertical" gap={0.5}>
                  <Text as="p" display="block">
                    {account.name}
                  </Text>
                  <Text as="p" display="block" color="secondary">
                    {account.user.name} · <Text>{account.type}</Text> ·{' '}
                    {account.householdCurrency.code}
                  </Text>
                </Stack>
                <Button
                  onClick={() => unarchive(account.id, account.name)}
                  label={`Unarchive ${account.name}`}
                  variant={'secondary'}

                  isDisabled={isInFlight}
                >
                  <AstryxIcon
                    icon={ArchiveRestore}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  {pendingId === account.id ? 'Unarchiving…' : 'Unarchive'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Stack>
      <Text as="p" display="block" color="secondary" role="status">
        {feedback}
      </Text>
    </Stack>
  )
}
