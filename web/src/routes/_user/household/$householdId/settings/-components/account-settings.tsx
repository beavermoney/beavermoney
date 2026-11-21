import { AccountAvatar } from '@/components/account-avatar'
import { InvestmentIcon } from '@/components/investment-icon'
import { InvestmentArchiveAction } from '@/components/investment-archive-action'
import { useFinanceLabel } from '@/hooks/use-finance-label'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { List, ListItem } from '@astryxdesign/core/List'
import { useState } from 'react'
import { graphql, useFragment, useMutation } from 'react-relay'
import type { accountSettingsFragment$key } from './__generated__/accountSettingsFragment.graphql'
import type { accountSettingsUnarchiveMutation } from './__generated__/accountSettingsUnarchiveMutation.graphql'

import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

const fragment = graphql`
  fragment accountSettingsFragment on Query {
    investments(where: { archived: true }) {
      edges {
        node {
          id
          name
          symbol
          type
          archived
          account {
            name
            icon
            archived
            user {
              name
            }
          }
          ...investmentArchiveActionFragment
        }
      }
    }
    accounts(where: { archived: true }) {
      edges {
        node {
          id
          name
          icon
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
  const financeLabel = useFinanceLabel()
  const { t } = useLingui()
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
        body: t`Could not unarchive ${name}. Please try again.`,
      })
      return
    }
    setFeedback(t`${name} is active again. You can find it in Accounts.`)
    showToast({ type: 'info', body: t`${name} unarchived.` })
  }

  return (
    <Stack
      direction="vertical"
      gap={4}
      as="section"

      aria-label={t`Account settings`}
    >
      <Stack
        direction="vertical"
        gap={4}
        as="section"
        aria-labelledby="archived-accounts-title"
      >
        <Stack direction="vertical" gap={1}>
          <Heading level={2} id="archived-accounts-title">
            <Trans>Archived accounts</Trans>
          </Heading>
          <Text as="p" display="block" color="secondary">
            <Trans>
              Unarchiving makes an account available for new transactions again.
              Its history stays intact.
            </Trans>
          </Text>
        </Stack>
        {accounts.length === 0 ? (
          <Text color="secondary">
            <Trans>No archived accounts</Trans>
          </Text>
        ) : (
          <List hasDividers edge="outset">
            {accounts.map((account) => (
              <ListItem
                key={account.id}
                id={account.id}
                startContent={<AccountAvatar account={account} size="small" />}
                label={<Text maxLines={2}>{account.name}</Text>}
                description={`${account.user.name} · ${financeLabel(account.type)} · ${account.householdCurrency.code}`}
                endContent={
                  <Button
                    onClick={() => unarchive(account.id, account.name)}
                    label={
                      pendingId === account.id ? t`Unarchiving…` : t`Unarchive`
                    }
                    aria-label={t`Unarchive ${account.name}`}
                    variant="secondary"
                    isDisabled={isInFlight}
                  />
                }
              />
            ))}
          </List>
        )}
      </Stack>
      <Stack
        direction="vertical"
        gap={4}
        as="section"
        aria-label={t`Archived investments`}
      >
        <Heading level={2}>{t`Archived investments`}</Heading>
        <Text color="secondary">{t`Restore an account first to make its investments available again. All history stays intact.`}</Text>
        <List hasDividers edge="outset">
          {(data.investments.edges ?? [])
            .flatMap((e) => (e?.node?.archived ? [e.node] : []))
            .map((holding) => (
              <ListItem
                key={holding.id}
                id={holding.id}
                startContent={
                  <InvestmentIcon
                    name={holding.name}
                    symbol={holding.symbol}
                    type={holding.type}
                  />
                }
                label={<Text maxLines={2}>{holding.name}</Text>}
                description={
                  <Stack direction="horizontal" gap={2} align="center">
                    <AccountAvatar account={holding.account} size="small" />
                    <Text maxLines={2}>
                      {holding.account.name} · {holding.account.user.name}
                    </Text>
                  </Stack>
                }
                endContent={<InvestmentArchiveAction fragmentRef={holding} />}
              />
            ))}
        </List>
      </Stack>
      <Text as="p" display="block" color="secondary" role="status">
        {feedback}
      </Text>
    </Stack>
  )
}
