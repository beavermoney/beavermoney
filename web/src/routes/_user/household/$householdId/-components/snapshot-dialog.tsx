import { useLingui } from '@lingui/react/macro'
import { useFinanceLabel } from '@/hooks/use-finance-label'
import { Trans } from '@lingui/react/macro'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import { useToast } from '@astryxdesign/core/Toast'
import currency from 'currency.js'
import { FlagIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useFragment, useMutation } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import type { snapshotDialogFragment$key } from './__generated__/snapshotDialogFragment.graphql'
import type { snapshotDialogMutation } from './__generated__/snapshotDialogMutation.graphql'

import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { commitMutationResult } from '@/lib/relay'

const SnapshotDialogFragment = graphql`
  fragment snapshotDialogFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    accounts(where: { archived: false, userIDIn: $viewUserIds }) {
      edges {
        node {
          type
          value
          householdCurrency {
            code
          }
        }
      }
    }
  }
`

const SnapshotDialogMutation = graphql`
  mutation snapshotDialogMutation($input: CreateSnapshotInput!) {
    createSnapshot(input: $input) {
      node {
        id
        createTime
      }
    }
  }
`

const CATEGORIES = [
  'liquidity',
  'investment',
  // 'property',
  'receivable',
  'liability',
] as const

type SnapshotDialogProps = {
  fragmentRef: snapshotDialogFragment$key
  renderTrigger?: (open: () => void) => ReactNode
}

export function SnapshotDialog({
  fragmentRef,
  renderTrigger,
}: SnapshotDialogProps) {
  const { t } = useLingui()
  const financeLabel = useFinanceLabel()
  const showToast = useToast()

  const data = useFragment(SnapshotDialogFragment, fragmentRef)
  const { household } = useHousehold()
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  const [commitMutation, isMutationInFlight] =
    useMutation<snapshotDialogMutation>(SnapshotDialogMutation)

  const breakdown = CATEGORIES.reduce(
    (acc, type) => {
      const total = (data.accounts.edges ?? [])
        .filter((e) => e?.node?.type === type)
        .reduce((sum, e) => {
          invariant(e?.node, 'Account edge node is null')
          return sum.add(convert(e.node.value, e.node.householdCurrency.code))
        }, currency(0))
      acc[type] = total
      return acc
    },
    {} as Record<(typeof CATEGORIES)[number], currency>,
  )

  const netWorth = CATEGORIES.reduce(
    (sum, type) => sum.add(breakdown[type]),
    currency(0),
  )

  const handleSnapshot = async () => {
    const result = await commitMutationResult<snapshotDialogMutation>(
      commitMutation,
      {
        variables: { input: { note: note.trim() || null } },
        updater: (store) => {
          store.get(household.id)?.invalidateRecord()
        },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        showToast({ type: 'info', body: t`Snapshot saved!` })
        setNote('')
        setOpen(false)
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: t`Failed to save snapshot: ${error}` })
      })
      .exhaustive()
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button
          onClick={() => setOpen(true)}

          label={t`Create snapshot`}
          isIconOnly
          variant={'ghost'}

          icon={<AstryxIcon icon={FlagIcon} />}
        ></Button>
      )}
      <Dialog isOpen={open} onOpenChange={setOpen} purpose="info" padding={0}>
        <Layout
          padding={6}
          header={
            <DialogHeader
              title={
                <>
                  <Trans>Snapshot</Trans>
                </>
              }
              onOpenChange={setOpen}
            />
          }
        >
          <LayoutContent>
            <Stack direction="vertical" gap={6} paddingBlockStart={4}>
              <Stack direction="vertical" gap={1}>
                <Text as="p" display="block" color="secondary">
                  <Trans>Net Worth</Trans>
                </Text>
                <Heading level={2}>
                  {formatCurrencyWithPrivacyMode({
                    value: netWorth,
                    currencyCode: displayCurrencyCode,
                  })}
                </Heading>
              </Stack>
              <Stack direction="vertical" gap={2}>
                {CATEGORIES.map((type) => (
                  <Stack
                    direction="horizontal"
                    gap={3}
                    align="center"
                    wrap="wrap"
                    justify="between"
                    key={type}
                  >
                    <Text color="secondary">{financeLabel(type)}</Text>
                    <Text hasTabularNumbers>
                      {formatCurrencyWithPrivacyMode({
                        value: breakdown[type],
                        currencyCode: displayCurrencyCode,
                        liability: type === 'liability',
                      })}
                    </Text>
                  </Stack>
                ))}
              </Stack>
              <TextArea
                placeholder={t`What changed since your last snapshot?`}
                label={t`Note (optional)`}

                value={String(note ?? '')}
                onChange={(_value, event) =>
                  ((e) => setNote(e.target.value))(event)
                }
              />
              <Stack
                direction="horizontal"
                gap={3}
                align="center"
                wrap="wrap"
                justify="end"
              >
                <Button
                  onClick={handleSnapshot}
                  label={String(isMutationInFlight ? t`Saving...` : t`Save`)}
                  variant={'primary'}

                  isDisabled={isMutationInFlight}
                >
                  {isMutationInFlight ? t`Saving...` : t`Save`}
                </Button>
                <Button label={t`Cancel`} onClick={() => setOpen(false)} />
              </Stack>
            </Stack>
          </LayoutContent>
        </Layout>
      </Dialog>
    </>
  )
}
