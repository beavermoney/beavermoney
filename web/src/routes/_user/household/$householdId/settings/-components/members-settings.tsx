import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { List, ListItem } from '@astryxdesign/core/List'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { MoreVerticalIcon } from 'lucide-react'
import { useState } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'

import type { membersSettingsFragment$key } from './__generated__/membersSettingsFragment.graphql'
import type { membersSettingsRemoveMutation } from './__generated__/membersSettingsRemoveMutation.graphql'
import type { membersSettingsUpdateRoleMutation } from './__generated__/membersSettingsUpdateRoleMutation.graphql'

import { useUser } from '@/hooks/use-user'
import { useUserHousehold } from '@/hooks/use-user-household'
import { commitMutationResult } from '@/lib/relay'
import { AddMemberDialog } from './add-member-dialog'

const membersSettingsFragment = graphql`
  fragment membersSettingsFragment on Household {
    id
    userHouseholds {
      id
      role
      householdCurrency {
        code
      }
      user {
        id
        name
        email
        isSynthetic
      }
    }
    ...addMemberDialogFragment
  }
`

const updateRoleMutation = graphql`
  mutation membersSettingsUpdateRoleMutation(
    $id: ID!
    $role: UserHouseholdRole!
  ) {
    updateHouseholdUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`

const removeMutation = graphql`
  mutation membersSettingsRemoveMutation($id: ID!) {
    removeHouseholdUser(id: $id) {
      removedUserHouseholdID
    }
  }
`

function getRoleErrorMessage(error: unknown): string {
  const msg = String(error)
  if (msg.includes('LAST_ADMIN_PROTECTED'))
    return t`At least one admin must remain.`
  if (msg.includes('NOT_HOUSEHOLD_ADMIN'))
    return t`Only household admins can change roles.`
  if (msg.includes('SYNTHETIC_USER_ROLE_CHANGE_NOT_ALLOWED'))
    return t`The joint owner's role is fixed and can't be changed.`
  if (msg.includes('MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD'))
    return t`Member changes are disabled on the demo household.`
  return t`Something went wrong. Please try again.`
}

function getRemoveErrorMessage(error: unknown): string {
  const msg = String(error)
  if (msg.includes('LAST_ADMIN_PROTECTED'))
    return t`At least one admin must remain.`
  if (msg.includes('MEMBER_HAS_OWNED_RECORDS'))
    return t`This member or the joint owner owns accounts, investments, or subscriptions. Remove or archive them first.`
  if (msg.includes('SELF_REMOVAL_NOT_ALLOWED'))
    return t`You can't remove yourself from the household.`
  if (msg.includes('SYNTHETIC_USER_REMOVAL_NOT_ALLOWED'))
    return t`The joint owner can't be removed directly. Remove your partner instead and the joint owner will be cleaned up.`
  if (msg.includes('NOT_HOUSEHOLD_ADMIN'))
    return t`Only household admins can remove members.`
  if (msg.includes('MEMBER_MUTATION_LOCKED_ON_DEMO_HOUSEHOLD'))
    return t`Member changes are disabled on the demo household.`
  return t`Something went wrong. Please try again.`
}

type MembersSettingsProps = {
  householdRef: membersSettingsFragment$key
}

export function MembersSettings({ householdRef }: MembersSettingsProps) {
  const { t } = useLingui()
  const showToast = useToast()

  const household = useFragment(membersSettingsFragment, householdRef)
  const { user } = useUser()
  const { userHousehold } = useUserHousehold()

  invariant(household.userHouseholds, 'userHouseholds is required')

  const isAdmin = userHousehold.role === 'admin'
  const householdId = household.id
  const realMemberCount = household.userHouseholds.filter(
    (uh) => !uh.user.isSynthetic,
  ).length
  const canInviteMore = realMemberCount < 2

  const [commitUpdateRole, isUpdateRoleInFlight] =
    useMutation<membersSettingsUpdateRoleMutation>(updateRoleMutation)
  const [commitRemove, isRemoveInFlight] =
    useMutation<membersSettingsRemoveMutation>(removeMutation)

  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)

  const handleRoleChange = async (
    userHouseholdId: string,
    nextRole: 'admin' | 'member',
  ) => {
    const result =
      await commitMutationResult<membersSettingsUpdateRoleMutation>(
        commitUpdateRole,
        {
          variables: {
            id: userHouseholdId,
            role: nextRole,
          },
          updater: (store) => {
            store.get(householdId)?.invalidateRecord()
          },
        },
      )

    match(result)
      .with({ status: 'success' }, () => {
        showToast({
          type: 'info',
          body:
            nextRole === 'admin'
              ? t`Member promoted to admin.`
              : t`Admin demoted to member.`,
        })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: getRoleErrorMessage(error) })
      })
      .exhaustive()
  }

  const handleConfirmRemove = async () => {
    if (removeTargetId === null) return

    const result = await commitMutationResult<membersSettingsRemoveMutation>(
      commitRemove,
      {
        variables: {
          id: removeTargetId,
        },
        updater: (store) => {
          store.get(householdId)?.invalidateRecord()
        },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        showToast({ type: 'info', body: t`Member removed.` })
        setRemoveTargetId(null)
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: getRemoveErrorMessage(error) })
      })
      .exhaustive()
  }

  return (
    <Stack direction="vertical" gap={3} width="100%" className="max-w-2xl">
      {isAdmin && canInviteMore && (
        <Stack direction="horizontal" gap={4}>
          <AddMemberDialog householdRef={household} />
        </Stack>
      )}
      <List edge="outset" hasDividers>
        {household.userHouseholds.map((uh) => {
          const isCurrentUser = uh.user.id === user.id
          const isSynthetic = uh.user.isSynthetic
          const showActions = isAdmin && !isCurrentUser && !isSynthetic
          const nextRole: 'admin' | 'member' =
            uh.role === 'admin' ? 'member' : 'admin'
          return (
            <ListItem
              key={uh.id}
              label={uh.user.name + (isCurrentUser ? ' (you)' : '')}
              description={
                <Stack direction="vertical" gap={0.5}>
                  <Text
                    type="supporting"
                    color="secondary"
                    className="break-all"
                  >
                    {isSynthetic
                      ? t`Shared owner — auto-managed`
                      : uh.user.email}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {isSynthetic
                      ? t`Joint`
                      : uh.role === 'admin'
                        ? t`Admin`
                        : t`Member`}{' '}
                    · {uh.householdCurrency.code}
                  </Text>
                </Stack>
              }
              endContent={
                <Stack direction="horizontal" gap={2} align="center">
                  {showActions && (
                    <DropdownMenu
                      alignment={'end'}
                      renderTrigger={(triggerProps) => (
                        <Button
                          {...triggerProps}

                          label={t`Actions for ${uh.user.name}`}
                          variant={'ghost'}

                          isIconOnly
                          icon={
                            <>
                              <AstryxIcon icon={MoreVerticalIcon} />
                            </>
                          }
                        ></Button>
                      )}
                    >
                      <DropdownMenuItem
                        isDisabled={isUpdateRoleInFlight}
                        onClick={() => handleRoleChange(uh.id, nextRole)}
                        label={
                          <>
                            {uh.role === 'admin'
                              ? t`Make member`
                              : t`Make admin`}
                          </>
                        }
                      />
                      <DropdownMenuItem
                        onClick={() => setRemoveTargetId(uh.id)}
                        label={
                          <>
                            <Trans>Remove from household</Trans>
                          </>
                        }
                      />
                    </DropdownMenu>
                  )}
                </Stack>
              }
            />
          )
        })}
      </List>

      <>
        <Dialog
          isOpen={removeTargetId !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveTargetId(null)
          }}
          purpose="info"
          role="alertdialog"
          padding={0}
        >
          <Layout
            padding={6}
            header={
              <DialogHeader
                title={
                  <>
                    <Trans>Remove member?</Trans>
                  </>
                }
                onOpenChange={(open) => {
                  if (!open) setRemoveTargetId(null)
                }}
              />
            }
          >
            <LayoutContent>
              <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                <Text as="div" display="block" type="supporting">
                  <Trans>
                    This will remove them from the household. They will lose
                    access immediately.
                  </Trans>
                </Text>
                <Stack
                  direction="horizontal"
                  gap={3}
                  align="center"
                  wrap="wrap"
                  justify="end"
                >
                  <Button
                    label={t`Cancel`}
                    onClick={() =>
                      ((open) => {
                        if (!open) setRemoveTargetId(null)
                      })(false)
                    }
                  />
                  <Button
                    variant="destructive"
                    isDisabled={isRemoveInFlight}
                    onClick={handleConfirmRemove}
                    label={t`Remove member`}
                  >
                    {isRemoveInFlight ? t`Removing...` : t`Remove`}
                  </Button>
                </Stack>
              </Stack>
            </LayoutContent>
          </Layout>
        </Dialog>
      </>
    </Stack>
  )
}
